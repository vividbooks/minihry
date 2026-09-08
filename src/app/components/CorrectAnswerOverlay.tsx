import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from './AudioManager';

interface CorrectAnswerOverlayProps {
  isSuccess: boolean;
  successText: string;
  failureText: string;
  autoHideDuration?: number;
}

export function CorrectAnswerOverlay({ 
  isSuccess, 
  successText, 
  failureText, 
  autoHideDuration 
}: CorrectAnswerOverlayProps) {
  const { playSound } = useAudio();

  // Přehrání zvuku při zobrazení overlay
  useEffect(() => {
    playSound(isSuccess ? 'correct' : 'incorrect');
  }, [isSuccess, playSound]);

  const getText = () => isSuccess ? successText : failureText;
  const getTextColor = () => isSuccess ? "#059669" : "#dc2626"; // emerald pro správně, red pro špatně

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative font-bold select-none"
            style={{ 
              fontSize: window.innerWidth < 640 ? '4rem' : '8rem',
              color: getTextColor(),
              fontFamily: 'VisbyRound, sans-serif'
            }}
            initial={{ 
              scale: 0.5, 
              y: 100, 
              rotate: -15,
              opacity: 0
            }}
            animate={{ 
              scale: [0.5, 1.3, 1],
              y: [100, -30, 0],
              rotate: [-15, 5, 0],
              opacity: [0, 1, 1]
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.5, 1],
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            {getText()}
            
            {/* Veselé efekty kolem textu */}
            <motion.div
              className={`absolute ${window.innerWidth < 640 ? '-top-4 -left-4 w-8 h-8' : '-top-8 -left-8 w-16 h-16'} rounded-full`}
              style={{ backgroundColor: getTextColor() }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 0],
                opacity: [0, 0.3, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3,
                times: [0, 0.5, 1]
              }}
            />
            
            <motion.div
              className={`absolute ${window.innerWidth < 640 ? '-top-2 -right-6 w-4 h-4' : '-top-4 -right-12 w-8 h-8'} rounded-full`}
              style={{ backgroundColor: getTextColor() }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 0.4, 0],
                y: [0, -20, -40]
              }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5
              }}
            />
            
            <motion.div
              className={`absolute ${window.innerWidth < 640 ? '-bottom-3 left-2 w-6 h-6' : '-bottom-6 left-4 w-12 h-12'} rounded-full`}
              style={{ backgroundColor: getTextColor() }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 0.8, 0],
                opacity: [0, 0.2, 0],
                x: [0, 30, 60]
              }}
              transition={{ 
                duration: 0.7, 
                delay: 0.4
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}