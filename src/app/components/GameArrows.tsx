import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GameArrowsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMove: boolean;
  isGameRunning: boolean;
}

export function GameArrows({ onMoveLeft, onMoveRight, canMove, isGameRunning }: GameArrowsProps) {
  if (!isGameRunning || !canMove) return null;

  return (
    <>
      {/* Levá šipka */}
      <motion.button
        onClick={onMoveLeft}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-600 rounded-full shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
      >
        <ChevronLeft size={24} />
      </motion.button>

      {/* Pravá šipka */}
      <motion.button
        onClick={onMoveRight}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-600 rounded-full shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
      >
        <ChevronRight size={24} />
      </motion.button>
    </>
  );
}