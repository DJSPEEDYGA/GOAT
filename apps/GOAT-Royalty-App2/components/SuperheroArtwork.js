/**
 * GOAT Royalty App - Superhero Artwork Showcase
 * Featuring The Gangsta Nerds and Waka Flocka Flame as superheroes
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Heart, Share2, Star, Zap } from 'lucide-react';

const SuperheroArtwork = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likedImages, setLikedImages] = useState(new Set());

  // Superhero artwork collection
  const superheroArtwork = [
    {
      id: 1,
      title: "The Gangsta Nerds - Elite Squad",
      description: "Marvel-inspired superhero team with nerdy swagger and street credibility",
      filename: "DALL·E 2025-05-10 22.26.34 - A group of ultra-realistic Marvel-inspired cartoon superheroes called _The Gangsta Nerds_ in a comic book style. The characters have a blend of nerdy .webp",
      category: "Team",
      featured: true,
      likes: "15.2K"
    },
    {
      id: 2,
      title: "Waka Flocka Flame - Superhero Mode",
      description: "Tactical armored superhero version ready for action",
      filename: "DALL·E 2025-05-10 22.26.08 - Create an ultra-realistic superhero cartoon of Waka Flocka Flame in a Marvel-style cinematic comic universe. He is wearing a tactical armored superher.webp",
      category: "Hero",
      featured: true,
      likes: "12.8K"
    },
    {
      id: 3,
      title: "GOAT & Waka - Dynamic Duo",
      description: "Flying side by side through the Marvel universe",
      filename: "DALL·E 2025-05-10 22.25.53 - Create an ultra-realistic animated cartoon of Waka Flocka Flame as a superhero alongside a flying superhero goat. Both characters are in a dynamic Mar.webp",
      category: "Duo",
      featured: true,
      likes: "18.5K"
    },
    {
      id: 4,
      title: "Gangsta Nerds - Assembled",
      description: "The complete team ready to save the music universe",
      filename: "DALL·E 2025-05-10 22.26.30 - A group of ultra-realistic Marvel-inspired cartoon superheroes called _The Gangsta Nerds_ in a comic book style. The characters have a blend of nerdy .webp",
      category: "Team",
      featured: true,
      likes: "14.3K"
    },
    {
      id: 5,
      title: "Waka Supreme - Armored Hero",
      description: "Ultimate tactical superhero transformation",
      filename: "DALL·E 2025-05-10 22.26.02 - Create an ultra-realistic superhero cartoon of Waka Flocka Flame in a Marvel-style cinematic comic universe. He is wearing a tactical armored superher.webp",
      category: "Hero",
      featured: false,
      likes: "11.7K"
    },
    {
      id: 6,
      title: "Sky Patrol - GOAT & Waka",
      description: "Protecting the skies with superhero powers",
      filename: "DALL·E 2025-05-10 22.25.58 - Create an ultra-realistic animated cartoon of Waka Flocka Flame as a superhero alongside a flying superhero goat. Both characters are in a dynamic Mar.webp",
      category: "Duo",
      featured: false,
      likes: "16.9K"
    },
    {
      id: 7,
      title: "Gangsta Nerds Power Pose",
      description: "Street-smart superheroes ready for action",
      filename: "DALL·E 2025-05-10 22.26.15 - Create ultra-realistic cartoon superhero versions of two characters inspired by Waka Flocka Flame and another stylish individual with a confident nerd.webp",
      category: "Team",
      featured: false,
      likes: "13.1K"
    },
    {
      id: 8,
      title: "The Confident Heroes",
      description: "Waka Flocka and squad showing superhero confidence",
      filename: "DALL·E 2025-05-10 22.26.18 - Create ultra-realistic cartoon superhero versions of two characters inspired by Waka Flocka Flame and another stylish individual with a confident nerd.webp",
      category: "Team",
      featured: false,
      likes: "10.4K"
    }
  ];

  const currentImage = superheroArtwork[currentImageIndex];

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % superheroArtwork.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + superheroArtwork.length) % superheroArtwork.length);
    }
  };

  const toggleLike = () => {
    const newLiked = new Set(likedImages);
    if (newLiked.has(currentImage.id)) {
      newLiked.delete(currentImage.id);
    } else {
      newLiked.add(currentImage.id);
    }
    setLikedImages(newLiked);
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

  const shareArtwork = () => {
    if (navigator.share) {
      navigator.share({
        title: currentImage.title,
        text: currentImage.description,
        url: window.location.href
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
              Superhero Artwork Gallery
            </span>
          </h2>
          <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-white/70 text-lg">
          Featuring The Gangsta Nerds and Waka Flocka Flame as Marvel-inspired superheroes
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
          <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
            {superheroArtwork.length} Exclusive Artworks
          </span>
          <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
            Marvel-Inspired Style
          </span>
          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
            GOAT Universe
          </span>
        </div>
      </div>

      {/* Main Artwork Display */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-br from-purple-900/50 via-black to-red-900/50 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          {/* Navigation Buttons */}
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all z-20"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all z-20"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Image Display */}
          <div className="relative aspect-video">
            <img
              src={`/artwork/${encodeURIComponent(currentImage.filename)}`}
              alt={currentImage.title}
              className="w-full h-full object-cover"
            />
            
            {/* Featured Badge */}
            {currentImage.featured && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                <Star className="w-4 h-4 inline mr-1" />
                FEATURED
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-sm text-white">
              {currentImage.category}
            </div>

            {/* Action Buttons Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleLike}
                  className={`p-3 backdrop-blur-md rounded-full transition-all ${
                    likedImages.has(currentImage.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likedImages.has(currentImage.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={shareArtwork}
                  className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
                {currentImage.likes} likes
              </div>
            </div>
          </div>
        </div>

        {/* Artwork Information */}
        <div className="mt-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">{currentImage.title}</h3>
          <p className="text-white/70 mb-4">{currentImage.description}</p>
          <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
            <span>Artwork {currentImageIndex + 1} of {superheroArtwork.length}</span>
            <span>•</span>
            <span>{currentImage.category} Series</span>
            <span>•</span>
            <span>{currentImage.likes} Reactions</span>
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-white mb-4">Gallery Collection</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {superheroArtwork.map((artwork, index) => (
            <button
              key={artwork.id}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative rounded-lg overflow-hidden transition-all ${
                index === currentImageIndex
                  ? 'ring-2 ring-purple-500 scale-105'
                  : 'hover:scale-105 hover:ring-1 hover:ring-purple-400'
              }`}
            >
              <img
                src={`/artwork/${encodeURIComponent(artwork.filename)}`}
                alt={artwork.title}
                className="w-full h-32 object-cover"
              />
              {artwork.featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-black p-1 rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
              {index === currentImageIndex && (
                <div className="absolute inset-0 ring-2 ring-purple-500 pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Team Artworks</h3>
          </div>
          <p className="text-white/70 mb-4">The Gangsta Nerds assembled in their superhero glory</p>
          <div className="text-purple-400 text-sm">
            {superheroArtwork.filter(a => a.category === 'Team').length} Artworks
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Hero Portraits</h3>
          </div>
          <p className="text-white/70 mb-4">Individual superhero transformations and power poses</p>
          <div className="text-red-400 text-sm">
            {superheroArtwork.filter(a => a.category === 'Hero').length} Artworks
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Dynamic Duos</h3>
          </div>
          <p className="text-white/70 mb-4">GOAT and Waka Flocka team up for epic adventures</p>
          <div className="text-yellow-400 text-sm">
            {superheroArtwork.filter(a => a.category === 'Duo').length} Artworks
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center text-white/60">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <span>🦸‍♂️ {superheroArtwork.length} Total Artworks</span>
          <span>•</span>
          <span>⭐ {superheroArtwork.filter(a => a.featured).length} Featured Pieces</span>
          <span>•</span>
          <span>🔥 {superheroArtwork.reduce((sum, a) => sum + parseInt(a.likes.replace('K', '000')), 0).toLocaleString()} Total Likes</span>
        </div>
      </div>
    </div>
  );
};

export default SuperheroArtwork;