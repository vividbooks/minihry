import React from 'react';
import { motion } from 'motion/react';

interface TimeIndicatorProps {
  timeLeft: number;
  totalTime: number;
}

export function TimeIndicator({ timeLeft, totalTime }: TimeIndicatorProps) {
  const percentage = (timeLeft / totalTime) * 100;
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Grafický časový indikátor */}
      <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <motion.div 
          className={`h-full rounded-full transition-colors duration-500 ${
            percentage > 60 ? 'bg-green-500' : 
            percentage > 30 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}