// Tracks Management Page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider'
import { supabaseHelpers } from '../lib/supabase'
import { 
  Music, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Settings
} from 'lucide-react'

export default function TracksPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTrack, setEditingTrack] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    genre: '',
    isrc: '',
    release_date: '',
    streaming_platforms: []
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadTracks()
  }, [user, router])

  const loadTracks = async () => {
    try {
      const userTracks = await supabaseHelpers.getUserTracks(user.id)
      setTracks(userTracks)
    } catch (error) {
      console.error('Error loading tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const trackData = {
        ...formData,
        user_id: user.id,
        streams: Math.floor(Math.random() * 1000000),
        revenue: (Math.random() * 5000).toFixed(2)
      }

      if (editingTrack) {
        await supabaseHelpers.updateTrack(editingTrack.id, trackData)
      } else {
        await supabaseHelpers.saveTrack(trackData)
      }

      await loadTracks()
      setShowAddModal(false)
      setEditingTrack(null)
      setFormData({
        title: '',
        artist: '',
        album: '',
        duration: '',
        genre: '',
        isrc: '',
        release_date: '',
        streaming_platforms: []
      })
    } catch (error) {
      console.error('Error saving track:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (track) => {
    setEditingTrack(track)
    setFormData({
      title: track.title || '',
      artist: track.artist || '',
      album: track.album || '',
      duration: track.duration || '',
      genre: track.genre || '',
      isrc: track.isrc || '',
      release_date: track.release_date || '',
      streaming_platforms: track.streaming_platforms || []
    })
    setShowAddModal(true)
  }

  const handleDelete = async (trackId) => {
    if (confirm('Are you sure you want to delete this track?')) {
      try {
        await supabaseHelpers.deleteTrack(trackId)
        await loadTracks()
      } catch (error) {
        console.error('Error deleting track:', error)
      }
    }
  }

  const filteredTracks = tracks.filter(track =>
    track.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.album?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
              <h1 className="text-xl font-bold text-white">Tracks</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Track
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tracks, artists, albums..."
              className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-black/50 border border-gray-600 rounded-xl text-gray-300 hover:bg-black/70 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-black/50 border border-gray-600 rounded-xl text-gray-300 hover:bg-black/70 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Music className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {tracks.length}
              </span>
            </div>
            <p className="text-gray-300">Total Tracks</p>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-green-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {tracks.reduce((sum, track) => sum + (track.streams || 0), 0).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-300">Total Streams</p>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                ${tracks.reduce((sum, track) => sum + parseFloat(track.revenue || 0), 0).toFixed(2)}
              </span>
            </div>
            <p className="text-gray-300">Total Revenue</p>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-orange-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">
                {tracks.filter(t => t.streaming_platforms?.length > 0).length}
              </span>
            </div>
            <p className="text-gray-300">Published</p>
          </div>
        </div>

        {/* Tracks List */}
        <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading tracks...</div>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Music className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-300 mb-4">No tracks found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Add Your First Track
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Track
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Streams
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-black/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {track.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {track.artist} • {track.album || 'Single'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {(track.streams || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-400">
                          ${parseFloat(track.revenue || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTrack(track)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(track)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(track.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Track Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black rounded-xl border border-purple-500/20 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingTrack ? 'Edit Track' : 'Add New Track'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Track Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter track title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter artist name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Album
                </label>
                <input
                  type="text"
                  value={formData.album}
                  onChange={(e) => setFormData({...formData, album: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter album name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="3:45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Hip Hop"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingTrack(null)
                    setFormData({
                      title: '',
                      artist: '',
                      album: '',
                      duration: '',
                      genre: '',
                      isrc: '',
                      release_date: '',
                      streaming_platforms: []
                    })
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  {editingTrack ? 'Update' : 'Add'} Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}