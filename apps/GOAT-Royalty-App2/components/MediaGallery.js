/**
 * GOAT Royalty App - Media Gallery Component
 * Interactive gallery with custom videos and images
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Heart, Share2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const MediaGallery = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likedItems, setLikedItems] = useState(new Set());
  const videoRef = useRef(null);

  // Custom media collection with superhero goat theme
  const mediaCollection = [
    {
      id: 1,
      type: 'video',
      title: "Grok Video Episode 1",
      description: "The beginning of the GOAT superhero saga",
      thumbnail: "/artwork/DALL·E 2025-04-27 13.50.52 - Create a highly realistic Marvel superhero-style logo for the GOAT Royalty App by DJ Speedy. The design should feature a powerful superhero goat chara(1).webp",
      videoSrc: "/videos/grok-video- (1).mp4",
      duration: "3:24",
      views: "425K",
      likes: "24.2K"
    },
    {
      id: 2,
      type: 'video',
      title: "Grok Video Episode 2",
      description: "The Gangsta Nerds assemble their powers",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.26.34 - A group of ultra-realistic Marvel-inspired cartoon superheroes called _The Gangsta Nerds_ in a comic book style. The characters have a blend of nerdy .webp",
      videoSrc: "/videos/grok-video- (2).mp4",
      duration: "3:18",
      views: "387K",
      likes: "21.8K"
    },
    {
      id: 3,
      type: 'video',
      title: "Grok Video Episode 3",
      description: "Waka Flocka Flame transforms into superhero mode",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.26.08 - Create an ultra-realistic superhero cartoon of Waka Flocka Flame in a Marvel-style cinematic comic universe. He is wearing a tactical armored superher.webp",
      videoSrc: "/videos/grok-video- (3).mp4",
      duration: "2:58",
      views: "523K",
      likes: "31.5K"
    },
    {
      id: 4,
      type: 'video',
      title: "Grok Video Episode 4",
      description: "The GOAT superhero takes flight",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.25.53 - Create an ultra-realistic animated cartoon of Waka Flocka Flame as a superhero alongside a flying superhero goat. Both characters are in a dynamic Mar.webp",
      videoSrc: "/videos/grok-video- (4).mp4",
      duration: "1:46",
      views: "298K",
      likes: "18.3K"
    },
    {
      id: 5,
      type: 'video',
      title: "Grok Video Episode 5",
      description: "Epic battle scene in the GOAT universe",
      thumbnail: "/artwork/DALL·E 2025-04-27 13.55.47 - Create a highly realistic Marvel superhero-style logo for the GOAT Royalty App by DJ Speedy. The design should feature a powerful superhero goat chara(1).webp",
      videoSrc: "/videos/grok-video- (5).mp4",
      duration: "4:52",
      views: "642K",
      likes: "45.7K"
    },
    {
      id: 6,
      type: 'video',
      title: "Grok Video Episode 6",
      description: "The rise of the superhero alliance",
      thumbnail: "/artwork/DALL·E 2025-04-27 13.51.17 - Create a highly realistic Marvel-style cartoon movie logo for the GOAT Royalty App by DJ Speedy. The logo should feature a powerful superhero goat cha(1).webp",
      videoSrc: "/videos/grok-video- (6).mp4",
      duration: "3:15",
      views: "418K",
      likes: "27.9K"
    },
    {
      id: 7,
      type: 'video',
      title: "Grok Video Episode 7",
      description: "Musical powers unleashed",
      thumbnail: "/artwork/DALL·E 2025-04-27 14.36.55 - Create a realistic app icon mockup for the GOAT Royalty App by DJ Speedy. Use a clean, vivid square design featuring the red superhero goat head with (1).webp",
      videoSrc: "/videos/grok-video- (7).mp4",
      duration: "2:44",
      views: "356K",
      likes: "22.1K"
    },
    {
      id: 8,
      type: 'video',
      title: "Grok Video Episode 8",
      description: "The final showdown",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.25.58 - Create an ultra-realistic animated cartoon of Waka Flocka Flame as a superhero alongside a flying superhero goat. Both characters are in a dynamic Mar.webp",
      videoSrc: "/videos/grok-video- (8).mp4",
      duration: "3:37",
      views: "789K",
      likes: "52.3K"
    },
    {
      id: 9,
      type: 'video',
      title: "Grok Video Episode 9",
      description: "Heroes united in victory",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.26.18 - Create ultra-realistic cartoon superhero versions of two characters inspired by Waka Flocka Flame and another stylish individual with a confident nerd.webp",
      videoSrc: "/videos/grok-video- (9).mp4",
      duration: "4:12",
      views: "567K",
      likes: "38.6K"
    },
    {
      id: 10,
      type: 'video',
      title: "Grok Video Episode 10",
      description: "The legend continues",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.26.30 - A group of ultra-realistic Marvel-inspired cartoon superheroes called _The Gangsta Nerds_ in a comic book style. The characters have a blend of nerdy .webp",
      videoSrc: "/videos/grok-video- (10).mp4",
      duration: "3:55",
      views: "892K",
      likes: "61.4K"
    },
    {
      id: 11,
      type: 'video',
      title: "Grok Video Episode 11 - NERD BITCH3",
      description: "The ultimate transformation finale",
      thumbnail: "/artwork/DALL·E 2025-05-10 22.26.15 - Create ultra-realistic cartoon superhero versions of two characters inspired by Waka Flocka Flame and another stylish individual with a confident nerd.webp",
      videoSrc: "/videos/grok-video- NERD BITCH3.mp4",
      duration: "5:23",
      views: "1.2M",
      likes: "87.5K"
    },
    {
      id: 12,
      type: 'image',
      title: "GOAT Superhero Logo - Official",
      description: "The iconic Marvel-style superhero logo",
      imageSrc: "/artwork/DALL·E 2025-04-27 13.50.52 - Create a highly realistic Marvel superhero-style logo for the GOAT Royalty App by DJ Speedy. The design should feature a powerful superhero goat chara.webp",
      views: "245K",
      likes: "18.9K"
    },
    {
      id: 13,
      type: 'image',
      title: "GOAT Logo - Enhanced Version",
      description: "High-definition superhero logo variant",
      imageSrc: "/artwork/DALL·E 2025-04-27 13.50.52 - Create a highly realistic Marvel superhero-style logo for the GOAT Royalty App by DJ Speedy. The design should feature a powerful superhero goat chara(1).webp",
      views: "198K",
      likes: "15.2K"
    },
    {
      id: 14,
      type: 'image',
      title: "GOAT Movie Logo",
      description: "Cinematic movie-style logo",
      imageSrc: "/artwork/DALL·E 2025-04-27 13.51.17 - Create a highly realistic Marvel-style cartoon movie logo for the GOAT Royalty App by DJ Speedy. The logo should feature a powerful superhero goat cha.webp",
      views: "167K",
      likes: "12.4K"
    },
    {
      id: 15,
      type: 'image',
      title: "GOAT App Icon - Square Design",
      description: "Professional app icon with superhero theme",
      imageSrc: "/artwork/DALL·E 2025-04-27 14.36.55 - Create a realistic app icon mockup for the GOAT Royalty App by DJ Speedy. Use a clean, vivid square design featuring the red superhero goat head with (1).webp",
      views: "134K",
      likes: "9.8K"
    }
  ];

  const currentMedia = mediaCollection[currentMediaIndex];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleLike = () => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(currentMedia.id)) {
      newLiked.delete(currentMedia.id);
    } else {
      newLiked.add(currentMedia.id);
    }
    setLikedItems(newLiked);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const navigateMedia = (direction) => {
    if (direction === 'next') {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaCollection.length);
    } else {
      setCurrentMediaIndex((prev) => (prev - 1 + mediaCollection.length) % mediaCollection.length);
    }
    setIsPlaying(false);
  };

  const shareMedia = () => {
    if (navigator.share) {
      navigator.share({
        title: currentMedia.title,
        text: currentMedia.description,
        url: window.location.href
      });
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') navigateMedia('prev');
      if (e.key === 'ArrowRight') navigateMedia('next');
      if (e.key === ' ') togglePlay();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentMediaIndex, isPlaying]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-400 to-pink-400 bg-clip-text text-transparent">
            GOAT Media Gallery
          </span>
        </h2>
        <p className="text-white/70">Exclusive 11-episode video series and 35+ superhero artworks from the GOAT universe</p>
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                  11 Original Episodes
                </span>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                  35+ Superhero Artworks
                </span>
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                  1M+ Total Views
                </span>
              </div>
      </div>

      {/* Main Media Display */}
      <div className="relative bg-black rounded-2xl overflow-hidden mb-6 shadow-2xl">
        {currentMedia.type === 'video' ? (
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster={currentMedia.thumbnail}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={currentMedia.videoSrc} type="video/mp4" />
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleLike}
                      className={`p-2 backdrop-blur-md rounded-full transition-all ${
                        likedItems.has(currentMedia.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedItems.has(currentMedia.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={shareMedia}
                      className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
                    >
                      <Maximize className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video">
            <img
              src={currentMedia.imageSrc}
              alt={currentMedia.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
              <span className="text-white text-sm">HD Image</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <button
          onClick={() => navigateMedia('prev')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => navigateMedia('next')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Media Information */}
      <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{currentMedia.title}</h3>
            <p className="text-white/70 mb-4">{currentMedia.description}</p>
            <div className="flex items-center space-x-6 text-sm text-white/60">
              <span>{currentMedia.views} views</span>
              <span>{currentMedia.likes} likes</span>
              {currentMedia.duration && <span>{currentMedia.duration}</span>}
            </div>
          </div>
          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Thumbnail Gallery - Enhanced Layout */}
      <div className="bg-black/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Media Collection</h4>
          <div className="text-white/60 text-sm">
            {mediaCollection.filter(m => m.type === 'video').length} Videos • {mediaCollection.filter(m => m.type === 'image').length} Images
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
          {mediaCollection.map((media, index) => (
            <button
              key={media.id}
              onClick={() => setCurrentMediaIndex(index)}
              className={`relative rounded-lg overflow-hidden transition-all ${
                index === currentMediaIndex
                  ? 'ring-2 ring-purple-500 scale-105'
                  : 'hover:scale-105'
              }`}
            >
              <img
                src={media.type === 'video' ? media.thumbnail : media.imageSrc}
                alt={media.title}
                className="w-full h-20 object-cover"
              />
              {media.type === 'video' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white" />
                </div>
              )}
              {media.type === 'video' && (
                <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-xs text-white">
                  {media.duration}
                </div>
              )}
              {index === currentMediaIndex && (
                <div className="absolute inset-0 ring-2 ring-purple-500 pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-8 text-center text-white/60 text-sm">
        <p>Keyboard shortcuts: ← → Navigate | Space Play/Pause</p>
      </div>
    </div>
  );
};

export default MediaGallery;