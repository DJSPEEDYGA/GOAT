/**
 * GOAT Royalty App - Streaming Integration Component
 * Integrates multiple music streaming services
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Heart, 
  ExternalLink,
  Spotify,
  Music,
  Youtube,
  Radio
} from 'lucide-react';

const StreamingIntegration = () => {
  const [activeService, setActiveService] = useState('spotify');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  const streamingServices = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: Spotify,
      color: '#1DB954',
      status: 'connected',
      tracks: [
        {
          id: '1',
          title: 'No Hands (feat. Roscoe Dash & Wale)',
          artist: 'Waka Flocka Flame',
          album: 'Flockaveli',
          duration: '4:01',
          image: '/artwork/DALL·E 2025-05-10 22.26.08 - Create an ultra-realistic superhero cartoon of Waka Flocka Flame in a Marvel-style cinematic comic universe. He is wearing a tactical armored superher.webp',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        {
          id: '2',
          title: 'Hard in Da Paint',
          artist: 'Waka Flocka Flame',
          album: 'Flockaveli',
          duration: '3:48',
          image: '/artwork/DALL·E 2025-05-10 22.25.53 - Create an ultra-realistic animated cartoon of Waka Flocka Flame as a superhero alongside a flying superhero goat. Both characters are in a dynamic Mar.webp',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        },
        {
          id: '3',
          title: 'Grove St. Party',
          artist: 'Waka Flocka Flame',
          album: 'Flockaveli',
          duration: '3:56',
          image: '/artwork/DALL·E 2025-05-10 22.26.34 - A group of ultra-realistic Marvel-inspired cartoon superheroes called _The Gangsta Nerds_ in a comic book style. The characters have a blend of nerdy .webp',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        }
      ]
    },
    {
      id: 'apple',
      name: 'Apple Music',
      icon: Music,
      color: '#FA243C',
      status: 'connected',
      tracks: [
        {
          id: '4',
          title: 'O Lets Do It',
          artist: 'Waka Flocka Flame',
          album: 'Flockaveli',
          duration: '4:23',
          image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
        },
        {
          id: '5',
          title: 'Bustin At Em',
          artist: 'Waka Flocka Flame',
          album: 'Flockaveli',
          duration: '3:35',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
        }
      ]
    },
    {
      id: 'youtube',
      name: 'YouTube Music',
      icon: Youtube,
      color: '#FF0000',
      status: 'connected',
      tracks: [
        {
          id: '6',
          title: 'Round of Applause',
          artist: 'Waka Flocka Flame ft. Drake',
          album: 'Triple F Life',
          duration: '3:52',
          image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
        },
        {
          id: '7',
          title: 'I Dont Really Care',
          artist: 'Waka Flocka Flame',
          album: 'Salute Me or Shoot Me 3',
          duration: '4:15',
          image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
        }
      ]
    },
    {
      id: 'tidal',
      name: 'Tidal',
      icon: Radio,
      color: '#000000',
      status: 'connected',
      tracks: [
        {
          id: '8',
          title: 'For My Dawgs',
          artist: 'Waka Flocka Flame',
          album: 'Salute Me or Shoot Me 2',
          duration: '4:08',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
        }
      ]
    }
  ];

  const activeServiceData = streamingServices.find(s => s.id === activeService);

  useEffect(() => {
    if (activeServiceData && activeServiceData.tracks.length > 0) {
      setCurrentTrack(activeServiceData.tracks[0]);
    }
  }, [activeService]);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const skipTrack = (direction) => {
    const tracks = activeServiceData.tracks;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % tracks.length;
      playTrack(tracks[nextIndex]);
    } else {
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      playTrack(tracks[prevIndex]);
    }
  };

  const handleProgressChange = (e) => {
    setProgress(e.target.value);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Streaming Integration
          </span>
        </h2>
        <p className="text-white/70">Connect and play from multiple streaming services</p>
      </div>

      {/* Service Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {streamingServices.map((service) => {
          const IconComponent = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                activeService === service.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{service.name}</span>
              <div className={`w-2 h-2 rounded-full ${
                service.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Main Player */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-8 backdrop-blur-md border border-white/10 mb-8">
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={currentTrack?.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'}
            alt={currentTrack?.title || 'No track playing'}
            className="w-32 h-32 rounded-xl shadow-2xl"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">
              {currentTrack?.title || 'Select a track'}
            </h3>
            <p className="text-white/70 mb-4">
              {currentTrack?.artist || 'No artist'} • {currentTrack?.album || 'No album'}
            </p>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Heart className="w-5 h-5 text-white/70" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ExternalLink className="w-5 h-5 text-white/70" />
              </button>
              <span className="text-white/60 text-sm">{currentTrack?.duration || '0:00'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-white/60">0:00</span>
              <span className="text-xs text-white/60">{currentTrack?.duration || '0:00'}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 rounded-full transition-colors ${
              isShuffled ? 'bg-purple-600 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => skipTrack('prev')}
            className="p-3 rounded-full text-white/70 hover:bg-white/10 transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
          
          <button
            onClick={() => skipTrack('next')}
            className="p-3 rounded-full text-white/70 hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
          
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'bg-purple-600 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <Repeat className={`w-4 h-4 ${repeatMode === 'one' ? 'scale-75' : ''}`} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-3 mt-6">
          <Volume2 className="w-4 h-4 text-white/70" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-white/60 text-sm w-10">{volume}%</span>
        </div>
      </div>

      {/* Track List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {activeServiceData.name} Library
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {activeServiceData.tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className={`flex items-center p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                currentTrack?.id === track.id ? 'bg-white/10' : ''
              }`}
            >
              <img
                src={track.image}
                alt={track.title}
                className="w-12 h-12 rounded-lg mr-4"
              />
              <div className="flex-1">
                <h4 className="text-white font-medium">{track.title}</h4>
                <p className="text-white/60 text-sm">{track.artist} • {track.album}</p>
              </div>
              <span className="text-white/60 text-sm mr-4">{track.duration}</span>
              {currentTrack?.id === track.id && isPlaying && (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {streamingServices.map((service) => {
          const IconComponent = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
            >
              <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color: service.color }} />
              <h4 className="text-white font-medium">{service.name}</h4>
              <p className="text-white/60 text-sm">{service.tracks.length} tracks</p>
              <div className={`mt-2 text-xs ${
                service.status === 'connected' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {service.status === 'connected' ? 'Connected' : 'Connect'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreamingIntegration;