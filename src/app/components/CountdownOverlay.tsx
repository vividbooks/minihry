import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CountdownOverlay({ isVisible, onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isVisible) return;

    setCount(3);
    
    const countdown = setInterval(() => {
      setCount(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdown);
          setTimeout(onComplete, 1200); // Počkej chvíli po "START"
          return 0;
        }
      });
    }, 1200);

    return () => clearInterval(countdown);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getText = () => {
    if (count > 0) return count.toString();
    return "START!";
  };

  const getTextColor = () => {
    if (count > 0) return "#4f46e5"; // indigo pro čísla
    return "#059669"; // emerald pro START
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          className="flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative font-bold select-none"
            style={{ 
              fontSize: count > 0 ? '12rem' : '8rem',
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
            
            {/* Veselé efekty kolem čísla */}
            <motion.div
              className="absolute -top-8 -left-8 w-16 h-16 rounded-full"
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
              className="absolute -top-4 -right-12 w-8 h-8 rounded-full"
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
              className="absolute -bottom-6 left-4 w-12 h-12 rounded-full"
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

      {/* Dodatečný text pod číslem */}
      <motion.div
        className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div 
          className="text-2xl font-medium"
          style={{ 
            color: getTextColor(),
            fontFamily: 'VisbyRound, sans-serif'
          }}
        >
          {count > 0 ? 'Připrav se...' : 'Hra začíná!'}
        </div>
      </motion.div>
    </div>
  );
}