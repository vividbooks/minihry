import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameResultModalProps {
  isVisible: boolean;
  correct: number;
  total: number;
  onContinue: () => void;
}

export function GameResultModal({ isVisible, correct, total, onContinue }: GameResultModalProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  const getGrade = () => {
    if (percentage >= 90) return { text: "Výborně!", stars: 3, color: "#fbbf24" };
    if (percentage >= 70) return { text: "Dobře!", stars: 2, color: "#3b82f6" };
    if (percentage >= 50) return { text: "Ucházející", stars: 1, color: "#22c55e" };
    return { text: "Zkus to znovu", stars: 0, color: "#ef4444" };
  };
  
  const grade = getGrade();

  // Auto-continue timer (5 sekund)
  useEffect(() => {
    if (!isVisible) return;
    
    const autoTimer = setTimeout(() => {
      onContinue();
    }, 5000);
    
    return () => clearTimeout(autoTimer);
  }, [isVisible, onContinue]);

  // Stars rendering
  const renderStars = () => (
    <div className="flex gap-1 justify-center mb-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <span 
          key={index}
          className={`text-3xl ${
            index < grade.stars ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-xl"
          >
            {/* Hodnocení hvězdičkami */}
            {renderStars()}
            
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: grade.color }}>
              {grade.text}
            </h2>
            
            {/* Skóre */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6">
              <div className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">
                {correct}/{total}
              </div>
              <div className="text-lg md:text-xl text-gray-600 mb-2">
                {percentage}% správně
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                <motion.div 
                  className="h-3 md:h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ backgroundColor: grade.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            
            {/* Tlačítko pokračovat */}
            <motion.button
              onClick={onContinue}
              className="w-full py-3 md:py-4 rounded-2xl text-lg md:text-xl font-medium text-white transition-colors shadow-lg"
              style={{ backgroundColor: grade.color }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Hrát znovu
            </motion.button>
            
            {/* Auto-continue info */}
            <div className="mt-4 text-sm text-gray-500">
              Automaticky pokračuje za 5 sekund...
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}