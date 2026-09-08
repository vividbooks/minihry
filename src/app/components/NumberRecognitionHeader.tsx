import React from 'react';
import { Heart } from 'lucide-react';

interface NumberRecognitionHeaderProps {
  round: number;
  totalRounds: number;
  score: number;
  lives: number;
  maxLives: number;
  timeLeft: number;
  totalTime: number;
}

export function NumberRecognitionHeader({
  round,
  totalRounds,
  score,
  lives,
  maxLives,
  timeLeft,
  totalTime
}: NumberRecognitionHeaderProps) {
  return (
    <div className="w-full bg-[#F5E6D0] py-6 px-4">
      <div className="flex flex-col items-center space-y-4 max-w-4xl mx-auto">
        {/* Velký název nahoře */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#4e5871] text-center">
          Poznej čísla
        </h1>
        
        {/* Skóre pod názvem */}
        <div className="text-2xl md:text-3xl font-medium text-[#4e5871]">
          Skóre: {score}
        </div>
        
        {/* Spodní řádek - Kolo, srdíčka, čas */}
        <div className="flex items-center justify-between w-full max-w-2xl">
          {/* Kolo vlevo */}
          <div className="text-xl md:text-2xl font-medium text-[#4e5871] flex-1 text-left">
            Kolo {round}/{totalRounds}
          </div>
          
          {/* Srdíčka uprostřed */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {Array.from({ length: maxLives }, (_, i) => (
              <Heart
                key={i}
                className={`w-8 h-8 md:w-10 md:h-10 ${
                  i < lives
                    ? 'fill-red-500 text-red-500'
                    : 'fill-gray-300 text-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Čas vpravo */}
          <div className="text-xl md:text-2xl font-medium text-[#4e5871] flex-1 text-right">
            {timeLeft}s
          </div>
        </div>
      </div>
    </div>
  );
}