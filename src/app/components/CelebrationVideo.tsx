import React from 'react';
import { CelebrationVideo as CelebrationVideoType } from '../constants/celebrationVideos';

interface CelebrationVideoProps {
  video: CelebrationVideoType;
  isSuccess: boolean;
}

export function CelebrationVideo({ video, isSuccess }: CelebrationVideoProps) {
  if (!isSuccess) return null;

  return (
    <div className="absolute inset-0 z-0 flex items-end justify-center pb-8">
      <div className="w-[26rem] sm:w-[31.25rem] lg:w-[36.5rem] aspect-square">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover rounded-2xl"
          playsInline
        >
          <source 
            src={video.url}
            type="video/mp4" 
          />
          {/* Fallback pro prohlížeče bez podpory videa */}
          <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-orange-300 rounded-2xl flex items-center justify-center">
            <div className="text-xl sm:text-2xl text-white">Video se načítá...</div>
          </div>
        </video>
      </div>
    </div>
  );
}