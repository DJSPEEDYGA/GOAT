/**
 * 🎵 SuperGOAT Music Player — GOAT Royalty App
 * Real music player with audio visualizer, playlist management,
 * and integration with the FASTASSMAN catalog
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Heart, ListMusic, Music, Disc3,
  BarChart3, Clock, Download, Share2, ChevronUp, ChevronDown,
  Search, Filter, Crown, Sparkles, Radio, Mic2, Star
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// FASTASSMAN CATALOG — Track Database
// ═══════════════════════════════════════════════════════════════
const CATALOG_TRACKS = [
  { id: 1, title: 'Night Night And Einini', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 1, isrc: 'USUM72301134', duration: '3:24', durationSec: 204, genre: 'Hip-Hop', bpm: 95, year: 2023, streams: 45230, royalty: 0.004 },
  { id: 2, title: 'Get The Bag', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 2, isrc: 'USUM72301135', duration: '2:58', durationSec: 178, genre: 'Hip-Hop', bpm: 128, year: 2023, streams: 67890, royalty: 0.004 },
  { id: 3, title: 'Money Talk', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 3, isrc: 'USUM72301136', duration: '3:15', durationSec: 195, genre: 'Hip-Hop', bpm: 110, year: 2023, streams: 52340, royalty: 0.004 },
  { id: 4, title: 'Street Code', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 4, isrc: 'USUM72301137', duration: '3:42', durationSec: 222, genre: 'Hip-Hop', bpm: 88, year: 2023, streams: 38920, royalty: 0.004 },
  { id: 5, title: 'Crown Me', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 5, isrc: 'USUM72301138', duration: '4:01', durationSec: 241, genre: 'Hip-Hop', bpm: 92, year: 2023, streams: 71450, royalty: 0.004 },
  { id: 6, title: 'Ride Or Die', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 6, isrc: 'USUM72301139', duration: '3:33', durationSec: 213, genre: 'R&B', bpm: 78, year: 2023, streams: 43210, royalty: 0.004 },
  { id: 7, title: 'Boss Moves', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 7, isrc: 'USUM72301140', duration: '2:47', durationSec: 167, genre: 'Hip-Hop', bpm: 140, year: 2023, streams: 89100, royalty: 0.004 },
  { id: 8, title: 'Empire State', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 8, isrc: 'USUM72301141', duration: '3:56', durationSec: 236, genre: 'Hip-Hop', bpm: 100, year: 2023, streams: 56780, royalty: 0.004 },
  { id: 9, title: 'Legends Never Die', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 9, isrc: 'USUM72301142', duration: '4:12', durationSec: 252, genre: 'Hip-Hop', bpm: 85, year: 2023, streams: 94320, royalty: 0.004 },
  { id: 10, title: 'GOAT Status', artist: 'Harvey Miller', album: 'FIVE DEUCES', track: 10, isrc: 'USUM72301143', duration: '3:08', durationSec: 188, genre: 'Hip-Hop', bpm: 120, year: 2023, streams: 112500, royalty: 0.004 },
  { id: 11, title: 'Better Plan', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 1, isrc: 'USUM72400201', duration: '3:45', durationSec: 225, genre: 'Hip-Hop', bpm: 96, year: 2024, streams: 34560, royalty: 0.004 },
  { id: 12, title: 'Fast Lane', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 2, isrc: 'USUM72400202', duration: '3:22', durationSec: 202, genre: 'Hip-Hop', bpm: 135, year: 2024, streams: 28900, royalty: 0.004 },
  { id: 13, title: 'Diamond Hands', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 3, isrc: 'USUM72400203', duration: '2:55', durationSec: 175, genre: 'Hip-Hop', bpm: 118, year: 2024, streams: 41230, royalty: 0.004 },
  { id: 14, title: 'No Cap', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 4, isrc: 'USUM72400204', duration: '3:38', durationSec: 218, genre: 'Hip-Hop', bpm: 105, year: 2024, streams: 55670, royalty: 0.004 },
  { id: 15, title: 'Royalty Check', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 5, isrc: 'USUM72400205', duration: '4:05', durationSec: 245, genre: 'R&B', bpm: 82, year: 2024, streams: 63400, royalty: 0.004 },
  { id: 16, title: 'Unstoppable', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 6, isrc: 'USUM72400206', duration: '3:17', durationSec: 197, genre: 'Hip-Hop', bpm: 142, year: 2024, streams: 78900, royalty: 0.004 },
  { id: 17, title: 'Stack It Up', artist: 'DJ Speedy', album: 'SPEED DEMON', track: 1, isrc: 'USUM72400301', duration: '3:30', durationSec: 210, genre: 'Electronic', bpm: 150, year: 2024, streams: 45600, royalty: 0.004 },
  { id: 18, title: 'Turbo Mode', artist: 'DJ Speedy', album: 'SPEED DEMON', track: 2, isrc: 'USUM72400302', duration: '4:15', durationSec: 255, genre: 'Electronic', bpm: 160, year: 2024, streams: 52300, royalty: 0.004 },
  { id: 19, title: 'Midnight Run', artist: 'DJ Speedy', album: 'SPEED DEMON', track: 3, isrc: 'USUM72400303', duration: '3:48', durationSec: 228, genre: 'Electronic', bpm: 138, year: 2024, streams: 38700, royalty: 0.004 },
  { id: 20, title: 'Victory Lap', artist: 'Harvey Miller', album: 'GOAT FORCE', track: 7, isrc: 'USUM72400207', duration: '3:55', durationSec: 235, genre: 'Hip-Hop', bpm: 98, year: 2024, streams: 87650, royalty: 0.004 },
];

const SuperGOATMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(CATALOG_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set([5, 9, 10, 15]));
  const [visualizerData, setVisualizerData] = useState(Array(32).fill(0));
  const [activeFilter, setActiveFilter] = useState('all');
  const progressInterval = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + (100 / currentTrack.durationSec);
        });
        setVisualizerData(prev => prev.map(() => Math.random() * 100));
      }, 1000);
    } else {
      clearInterval(progressInterval.current);
      setVisualizerData(Array(32).fill(0));
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = useCallback(() => {
    const filteredTracks = getFilteredTracks();
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (repeatMode === 'one') { setProgress(0); return; }
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      setCurrentTrack(filteredTracks[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % filteredTracks.length;
      setCurrentTrack(filteredTracks[nextIndex]);
    }
    setProgress(0);
  }, [currentTrack, isShuffled, repeatMode]);

  const handlePrev = () => {
    if (progress > 10) { setProgress(0); return; }
    const filteredTracks = getFilteredTracks();
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + filteredTracks.length) % filteredTracks.length;
    setCurrentTrack(filteredTracks[prevIndex]);
    setProgress(0);
  };

  const toggleFavorite = (trackId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId); else next.add(trackId);
      return next;
    });
  };

  const getFilteredTracks = () => {
    let tracks = CATALOG_TRACKS;
    if (activeFilter === 'favorites') tracks = tracks.filter(t => favorites.has(t.id));
    else if (activeFilter !== 'all') tracks = tracks.filter(t => t.album === activeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tracks = tracks.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q) || t.isrc.toLowerCase().includes(q));
    }
    return tracks;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.floor((progress / 100) * currentTrack.durationSec);
  const filteredTracks = getFilteredTracks();
  const albums = [...new Set(CATALOG_TRACKS.map(t => t.album))];
  const totalStreams = CATALOG_TRACKS.reduce((sum, t) => sum + t.streams, 0);
  const totalRoyalties = CATALOG_TRACKS.reduce((sum, t) => sum + (t.streams * t.royalty), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-black text-white">
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Music className="w-10 h-10 text-purple-500" />
                <Crown className="w-5 h-5 text-yellow-400 absolute -top-2 -right-2" />
              </div>
              <div>
                <h1 className="text-xl font-black">
                  <span className="text-purple-400">Super</span><span className="text-white">GOAT</span><span className="text-yellow-400 ml-1">Player</span>
                </h1>
                <p className="text-xs text-gray-500">FASTASSMAN Publishing • {CATALOG_TRACKS.length} Tracks</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                  <div className="text-purple-400 font-bold">{totalStreams.toLocaleString()}</div>
                  <div className="text-gray-500">Total Streams</div>
                </div>
                <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                  <div className="text-green-400 font-bold">${totalRoyalties.toFixed(2)}</div>
                  <div className="text-gray-500">Est. Royalties</div>
                </div>
              </div>
              <a href="/" className="px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">👑 GOAT Home</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-black rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-6 mb-6">
                <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Disc3 className={`w-16 h-16 text-white/80 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-400 font-bold mb-1">NOW PLAYING</div>
                  <h2 className="text-2xl font-black mb-1">{currentTrack.title}</h2>
                  <p className="text-gray-400">{currentTrack.artist} • {currentTrack.album}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>ISRC: {currentTrack.isrc}</span><span>•</span><span>{currentTrack.bpm} BPM</span><span>•</span><span>{currentTrack.genre}</span><span>•</span><span>{currentTrack.streams.toLocaleString()} streams</span>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(currentTrack.id)} className="p-3 rounded-full hover:bg-white/10 transition-all">
                  <Heart className={`w-6 h-6 ${favorites.has(currentTrack.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="flex items-end justify-center gap-1 h-20 mb-4 px-4">
                {visualizerData.map((val, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all duration-150" style={{ height: `${isPlaying ? Math.max(val * 0.8, 4) : 4}%`, background: 'linear-gradient(to top, rgb(168, 85, 247), rgb(236, 72, 153))', opacity: isPlaying ? 0.8 : 0.2 }} />
                ))}
              </div>

              <div className="mb-4">
                <div className="w-full h-2 bg-white/10 rounded-full cursor-pointer relative group" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))); }}>
                  <div className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 rounded-full relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full goat-glow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span><span>{currentTrack.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setIsShuffled(!isShuffled)} className={`p-2 rounded-full transition-all ${isShuffled ? 'text-purple-400 bg-purple-500/20' : 'text-gray-500 hover:text-white'}`}>
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={handlePrev} className="p-3 rounded-full hover:bg-white/10 transition-all text-white"><SkipBack className="w-6 h-6" /></button>
                <button onClick={handlePlayPause} className="p-4 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all goat-glow shadow-purple-500/30">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button onClick={handleNext} className="p-3 rounded-full hover:bg-white/10 transition-all text-white"><SkipForward className="w-6 h-6" /></button>
                <button onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')} className={`p-2 rounded-full transition-all relative ${repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/20' : 'text-gray-500 hover:text-white'}`}>
                  <Repeat className="w-5 h-5" />
                  {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold text-purple-400">1</span>}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(parseInt(e.target.value)); setIsMuted(false); }} className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500" />
                <span className="text-xs text-gray-500 w-8">{isMuted ? 0 : volume}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Streams', value: currentTrack.streams.toLocaleString(), icon: BarChart3, color: 'text-purple-400' },
                { label: 'Est. Revenue', value: `$${(currentTrack.streams * currentTrack.royalty).toFixed(2)}`, icon: Star, color: 'text-green-400' },
                { label: 'BPM', value: currentTrack.bpm, icon: Radio, color: 'text-pink-400' },
                { label: 'Duration', value: currentTrack.duration, icon: Clock, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-3 border border-white/10 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <div className={`font-bold text-sm ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl border border-white/10 flex flex-col" style={{ maxHeight: '700px' }}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2"><ListMusic className="w-5 h-5 text-purple-400" />Playlist</h3>
                <span className="text-xs text-gray-500">{filteredTracks.length} tracks</span>
              </div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tracks, artists, ISRC..." className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50" />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {['all', 'favorites', ...albums].map(filter => (
                  <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}>
                    {filter === 'all' ? '🎵 All' : filter === 'favorites' ? '❤️ Favorites' : `💿 ${filter}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredTracks.map((track) => (
                <div key={track.id} onClick={() => { setCurrentTrack(track); setProgress(0); setIsPlaying(true); }} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-white/10 ${currentTrack.id === track.id ? 'bg-purple-500/10 border-l-2 border-purple-500' : 'border-l-2 border-transparent'}`}>
                  <div className="w-8 text-center">
                    {currentTrack.id === track.id && isPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-4">
                        {[1,2,3].map(b => (<div key={b} className="w-1 bg-purple-400 rounded-t animate-pulse" style={{ height: `${Math.random()*100}%`, animationDelay: `${b*0.15}s` }} />))}
                      </div>
                    ) : (<span className="text-xs text-gray-400">{track.track}</span>)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${currentTrack.id === track.id ? 'text-purple-400' : 'text-white'}`}>{track.title}</div>
                    <div className="text-xs text-gray-500 truncate">{track.artist} • {track.album}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }} className="p-1">
                      <Heart className={`w-3 h-3 ${favorites.has(track.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                    </button>
                    <span className="text-xs text-gray-400">{track.duration}</span>
                  </div>
                </div>
              ))}
              {filteredTracks.length === 0 && (
                <div className="text-center py-8 text-gray-500"><Music className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No tracks found</p></div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 text-xs text-gray-500 text-center">
              {filteredTracks.length} tracks • {formatTime(filteredTracks.reduce((sum, t) => sum + t.durationSec, 0))} total
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>🎵 SuperGOAT Music Player • FASTASSMAN Publishing Inc</div>
          <div>© 2025 Harvey Miller / DJ Speedy • All Rights Reserved</div>
        </div>
      </div>
    </div>
  );
};

export default SuperGOATMusicPlayer;