/**
 * GOAT Royalty App - Advanced Audio Visualizer
 * Real-time audio visualization with multiple effects
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Zap, Music, Waves } from 'lucide-react';

const AudioVisualizer = ({ audioElement, type = 'bars', color = 'purple' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (type === 'bars') {
        drawBars(ctx, dataArray, bufferLength, canvas.width, canvas.height);
      } else if (type === 'wave') {
        drawWave(ctx, dataArray, bufferLength, canvas.width, canvas.height);
      } else if (type === 'circular') {
        drawCircular(ctx, dataArray, bufferLength, canvas.width, canvas.height);
      }
    };

    const drawBars = (ctx, dataArray, bufferLength, width, height) => {
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, color === 'purple' ? '#a855f7' : '#3b82f6');
        gradient.addColorStop(0.5, color === 'purple' ? '#ec4899' : '#06b6d4');
        gradient.addColorStop(1, color === 'purple' ? '#8b5cf6' : '#0ea5e9');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    const drawWave = (ctx, dataArray, bufferLength, width, height) => {
      ctx.lineWidth = 2;
      ctx.strokeStyle = color === 'purple' ? '#a855f7' : '#3b82f6';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    const drawCircular = (ctx, dataArray, bufferLength, width, height) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 4;

      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const amplitude = (dataArray[i] / 255) * radius;

        ctx.beginPath();
        ctx.strokeStyle = `hsl(${(i / bufferLength) * 360}, 70%, 50%)`;
        ctx.lineWidth = 2;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * (radius + amplitude),
          centerY + Math.sin(angle) * (radius + amplitude)
        );
        ctx.stroke();
      }
    };

    const handlePlay = () => {
      setIsActive(true);
      draw();
    };

    const handlePause = () => {
      setIsActive(false);
      cancelAnimationFrame(animationRef.current);
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
    };
  }, [audioElement, type, color]);

  return (
    <div className="relative w-full h-full bg-black/50 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Music className="w-12 h-12 mx-auto mb-2 text-white/50" />
            <p className="text-white/50 text-sm">Play audio to see visualization</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;