import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';

interface GameFeedbackProps {
  isVisible: boolean;
  isCorrect: boolean;
  onComplete: () => void;
}

export function GameFeedback({ isVisible, isCorrect, onComplete }: GameFeedbackProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`rounded-full p-6 ${
              isCorrect ? 'bg-green-500' : 'bg-red-500'
            } text-white shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {isCorrect ? (
              <Check size={48} />
            ) : (
              <X size={48} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}