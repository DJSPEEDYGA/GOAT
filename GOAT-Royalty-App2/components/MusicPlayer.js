/**
 * GOAT Royalty App - Advanced Music Player
 * Professional music player with visual effects and controls
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Heart,
  MoreHorizontal
} from 'lucide-react';

const MusicPlayer = ({ tracks = [] }) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    skipTo(newTime);
  };

  const skipForward = () => {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(currentTrack + 1);
    } else if (isRepeat) {
      setCurrentTrack(0);
    }
  };

  const skipBackward = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    } else if (isRepeat) {
      setCurrentTrack(tracks.length - 1);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const track = tracks[currentTrack] || {
    title: 'No Hands (feat. Roscoe Dash & Wale)',
    artist: 'Waka Flocka Flame',
    album: 'Flockaveli',
    duration: '4:01',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-2xl p-6 shadow-2xl border border-white/10">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />

      {/* Track Info */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-20 h-20 rounded-xl goat-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 h-8 bg-white rounded-full animate-pulse" />
                <div className="w-1 h-12 bg-white rounded-full animate-pulse delay-100" />
                <div className="w-1 h-10 bg-white rounded-full animate-pulse delay-200" />
                <div className="w-1 h-14 bg-white rounded-full animate-pulse delay-300" />
                <div className="w-1 h-8 bg-white rounded-full animate-pulse delay-400" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{track.title}</h3>
          <p className="text-white/70">{track.artist} • {track.album}</p>
        </div>

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-white/70'}`} />
        </button>

        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <input
          ref={progressBarRef}
          type="range"
          min="0"
          max="100"
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={handleProgressChange}
          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/70">{formatTime(currentTime)}</span>
          <span className="text-xs text-white/70">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={() => setIsShuffle(!isShuffle)}
          className={`p-2 rounded-full transition-colors ${
            isShuffle ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-white/70'
          }`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={skipBackward}
          className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/70"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="p-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 goat-glow"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>

        <button
          onClick={skipForward}
          className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/70"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRepeat(!isRepeat)}
          className={`p-2 rounded-full transition-colors ${
            isRepeat ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-white/70'
          }`}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMute}
          className="text-white/70 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
        />
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>
    </div>
  );
};

export default MusicPlayer;