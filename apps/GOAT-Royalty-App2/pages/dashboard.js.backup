// Dashboard Page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider'
import { supabaseHelpers } from '../lib/supabase'
import { 
  Music, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Users, 
  Play,
  Plus,
  Eye,
  Download,
  LogOut,
  User,
  Settings
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadAnalytics()
  }, [user, router])

  const loadAnalytics = async () => {
    try {
      const data = await supabaseHelpers.getAnalytics(user.id)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Music className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-xl font-bold text-white">GOAT Royalty</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.user_metadata?.full_name || 'Artist'}!
          </h2>
          <p className="text-gray-300">
            Here's your music royalty overview
          </p>
        </div>

        {/* Stats Grid */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-2">
                <Music className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {analytics.totalTracks}
                </span>
              </div>
              <p className="text-gray-300">Total Tracks</p>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-green-500/20 p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  ${analytics.totalRoyalties.toFixed(2)}
                </span>
              </div>
              <p className="text-gray-300">Total Royalties</p>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-blue-500/20 p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {analytics.totalContracts}
                </span>
              </div>
              <p className="text-gray-300">Active Contracts</p>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-lg border-orange-500/20 p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold text-white">
                  +12.5%
                </span>
              </div>
              <p className="text-gray-300">Monthly Growth</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/tracks')}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Track
              </button>
              
              <button
                onClick={() => router.push('/royalties')}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                View Royalties
              </button>
              
              <button
                onClick={() => router.push('/contracts')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Manage Contracts
              </button>
              
              <button
                onClick={() => router.push('/analytics')}
                className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-purple-500/20 p-4">
              {analytics?.recentActivity?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivity.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">
                          {item.title || 'Activity'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-purple-500/20 p-6">
            <div className="flex items-center mb-4">
              <Music className="w-6 h-6 text-purple-400 mr-2" />
              <h4 className="text-lg font-semibold text-white">Streaming</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Connect your streaming accounts for real-time data
            </p>
            <button
              onClick={() => router.push('/streaming')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Configure Streaming →
            </button>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-purple-500/20 p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-400 mr-2" />
              <h4 className="text-lg font-semibold text-white">Publishing</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Manage your publishing rights and distributions
            </p>
            <button
              onClick={() => router.push('/publishing')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View Publishing →
            </button>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-purple-500/20 p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-400 mr-2" />
              <h4 className="text-lg font-semibold text-white">Copyright</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Protect your intellectual property and rights
            </p>
            <button
              onClick={() => router.push('/copyright')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Manage Copyright →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}