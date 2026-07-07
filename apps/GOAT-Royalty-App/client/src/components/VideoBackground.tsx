'use client';

import React, { useState, useEffect } from 'react';

interface VideoBackgroundProps {
  videoSrc?: string;
  opacity?: number;
  muted?: boolean;
  loop?: boolean;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ 
  videoSrc = "/goat-assets/videos/MAIN GOAT VIDEO 2.mp4",
  opacity = 0.3,
  muted = true,
  loop = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="video-background">
      {videoSrc && (
        <video
          autoPlay
          muted={muted}
          loop={loop}
          playsInline
          className={`transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadedData={() => setIsLoaded(true)}
          style={{ opacity }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoBackground;