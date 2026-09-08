import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CorrectAnswerOverlay } from './CorrectAnswerOverlay';
import { CelebrationVideo } from './CelebrationVideo';
import { getRandomCelebrationVideo } from '../constants/celebrationVideos';
import { useAudio } from './AudioManager';

type DisplayType = 'gameComplete' | 'correctAnswer';

interface GameResultScreenProps {
  isSuccess: boolean;
  onContinue?: () => void;
  autoHideDuration?: number;
  successText?: string;
  failureText?: string;
  showContinueButton?: boolean;
  displayType?: DisplayType;
}

export function GameResultScreen({ 
  isSuccess, 
  onContinue, 
  autoHideDuration,
  successText = "SPRÁVNĚ!",
  failureText = "ZKUS TO ZNOVU!",
  showContinueButton = true,
  displayType = 'gameComplete'
}: GameResultScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedVideo] = useState(getRandomCelebrationVideo);
  const { playSound } = useAudio();

  // Přehrání zvuku při zobrazení
  useEffect(() => {
    if (displayType === 'gameComplete') {
      // Pro dokončení hry přehrát oslavný zvuk
      playSound('gameComplete');
    } else {
      // Pro jednotlivé odpovědi přehrát správně/špatně zvuk
      playSound(isSuccess ? 'correct' : 'incorrect');
    }
  }, [isSuccess, displayType, playSound]);

  // Auto-hide funkce
  useEffect(() => {
    if (autoHideDuration && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onContinue) {
          onContinue();
        }
      }, autoHideDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onContinue]);

  if (!isVisible) return null;

  const handleContinue = () => {
    setIsVisible(false);
    if (onContinue) {
      onContinue();
    }
  };

  if (displayType === 'correctAnswer') {
    return (
      <CorrectAnswerOverlay
        isSuccess={isSuccess}
        successText={successText}
        failureText={failureText}
        autoHideDuration={autoHideDuration}
      />
    );
  }

  // Pro gameComplete typ zobrazíme plnou obrazovku s videem
  return (
    <div 
      className="fixed inset-0 z-50"
      style={{ backgroundColor: selectedVideo.backgroundColor }}
    >
      <CelebrationVideo video={selectedVideo} isSuccess={isSuccess} />

      {/* Hlavní obsah v popředí */}
      <div className="relative z-10 flex flex-col items-center justify-start w-full h-full p-4 sm:p-8 pt-16 sm:pt-24">
        
        {/* Text nahoře */}
        <div className="text-center mb-6 sm:mb-8 bg-[rgba(221,20,20,0)]">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl sm:text-7xl lg:text-8xl"
            style={{ 
              color: isSuccess ? '#4CAF50' : '#F44336'
            }}
          >
            {isSuccess ? successText : failureText}
          </motion.div>
        </div>

        {/* Tlačítko pokračovat pod textem */}
        {showContinueButton && (
          <motion.button
            onClick={handleContinue}
            className="px-8 py-3 bg-white rounded-full hover:shadow-xl transition-shadow"
            style={{ 
              color: '#333',
              border: '2px solid #ddd'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">Pokračovat</span>
          </motion.button>
        )}
      </div>

      {/* Auto-hide indikátor */}
      {autoHideDuration && autoHideDuration > 0 && (
        <div className="absolute top-4 right-4 text-gray-600 z-20">
          <div className="bg-white bg-opacity-80 rounded-full px-3 py-1 text-sm">
            Automaticky pokračuje za {autoHideDuration}s
          </div>
        </div>
      )}
    </div>
  );
}