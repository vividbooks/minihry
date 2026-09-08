import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RoundCountdownProps {
  onComplete: () => void;
}

export function RoundCountdown({ onComplete }: RoundCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Po dokončení odpočítávání zavolej callback
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-9xl font-bold text-white"
          >
            {count}
          </motion.div>
        ) : (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-7xl font-bold text-green-400"
          >
            START!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}