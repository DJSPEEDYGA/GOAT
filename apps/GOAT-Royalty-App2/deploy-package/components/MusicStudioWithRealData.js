// Music Studio Component with Real Supabase Data
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'
import { 
  Music, 
  Play, 
  Pause, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader,
  X,
  Save
} from 'lucide-react'

export default function MusicStudioWithRealData() {
  const { user } = useAuth()
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTrack, setEditingTrack] = useState(null)
  const [playingTrack, setPlayingTrack] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    genre: '',
    isrc: '',
    release_date: ''
  })

  useEffect(() => {
    if (user) {
      loadTracks()
    }
  }, [user])

  async function loadTracks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (error) {
      console.error('Error loading tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTrack(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('tracks')
        .insert([{
          ...formData,
          user_id: user.id,
          plays: 0,
          streams: 0,
          downloads: 0
        }])
        .select()

      if (error) throw error
      
      setTracks([data[0], ...tracks])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Error adding track:', error)
      alert('Error adding track: ' + error.message)
    }
  }

  async function handleUpdateTrack(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('tracks')
        .update(formData)
        .eq('id', editingTrack.id)
        .select()

      if (error) throw error
      
      setTracks(tracks.map(t => t.id === editingTrack.id ? data[0] : t))
      setEditingTrack(null)
      resetForm()
    } catch (error) {
      console.error('Error updating track:', error)
      alert('Error updating track: ' + error.message)
    }
  }

  async function handleDeleteTrack(trackId) {
    if (!confirm('Are you sure you want to delete this track?')) return

    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)

      if (error) throw error
      
      setTracks(tracks.filter(t => t.id !== trackId))
    } catch (error) {
      console.error('Error deleting track:', error)
      alert('Error deleting track: ' + error.message)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      artist: '',
      album: '',
      duration: '',
      genre: '',
      isrc: '',
      release_date: ''
    })
  }

  function openEditModal(track) {
    setEditingTrack(track)
    setFormData({
      title: track.title || '',
      artist: track.artist || '',
      album: track.album || '',
      duration: track.duration || '',
      genre: track.genre || '',
      isrc: track.isrc || '',
      release_date: track.release_date || ''
    })
  }

  const filteredTracks = tracks.filter(track =>
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Music Studio</h2>
          <p className="text-gray-400">Manage your music catalog</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Track</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Tracks</p>
          <p className="text-2xl font-bold text-white">{tracks.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Plays</p>
          <p className="text-2xl font-bold text-white">
            {tracks.reduce((sum, t) => sum + (t.plays || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Streams</p>
          <p className="text-2xl font-bold text-white">
            {tracks.reduce((sum, t) => sum + (t.streams || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tracks List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {searchQuery ? 'No tracks found' : 'No tracks yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="text-purple-400 hover:text-purple-300"
              >
                Add your first track
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="p-4 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                      className="p-2 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
                    >
                      {playingTrack === track.id ? (
                        <Pause className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Play className="w-5 h-5 text-purple-500" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{track.title}</h3>
                      <p className="text-sm text-gray-400">
                        {track.artist} {track.album && `• ${track.album}`}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        {track.genre && <span>{track.genre}</span>}
                        {track.duration && <span>{track.duration}s</span>}
                        {track.plays > 0 && <span>{track.plays.toLocaleString()} plays</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(track)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingTrack) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTrack ? 'Edit Track' : 'Add New Track'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingTrack(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingTrack ? handleUpdateTrack : handleAddTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ISRC Code
                </label>
                <input
                  type="text"
                  value={formData.isrc}
                  onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="US-XXX-XX-XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingTrack ? 'Update' : 'Add'} Track</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingTrack(null)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}