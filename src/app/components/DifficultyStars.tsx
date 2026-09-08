import React from 'react';
import { Star } from 'lucide-react';

interface DifficultyStarsProps {
  difficulty: 1 | 2 | 3;
  onChange: (difficulty: 1 | 2 | 3) => void;
  disabled?: boolean;
}

export function DifficultyStars({ difficulty, onChange, disabled = false }: DifficultyStarsProps) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level as 1 | 2 | 3)}
          disabled={disabled}
          className={`p-3 rounded-lg transition-colors ${
            difficulty >= level 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
        >
          <Star size={20} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}