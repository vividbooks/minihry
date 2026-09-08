import React from 'react';
import { motion } from 'motion/react';

interface NumberBlockProps {
  value: number;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  colorIndex?: number;
}

// Barevná paleta pro číselné bloky
const NUMBER_COLORS = [
  { bg: '#ef4444', text: '#ffffff' }, // červená
  { bg: '#3b82f6', text: '#ffffff' }, // modrá
  { bg: '#22c55e', text: '#ffffff' }, // zelená
  { bg: '#f59e0b', text: '#ffffff' }, // oranžová/žlutá
  { bg: '#8b5cf6', text: '#ffffff' }, // fialová
  { bg: '#ec4899', text: '#ffffff' }, // růžová
  { bg: '#06b6d4', text: '#ffffff' }, // cyan
  { bg: '#84cc16', text: '#ffffff' }, // lime
  { bg: '#f97316', text: '#ffffff' }, // oranžová
  { bg: '#6366f1', text: '#ffffff' }, // indigo
];

export function NumberBlock({ value, size = 'large', className = '', colorIndex = 0 }: NumberBlockProps) {
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-20 h-20 text-3xl',
    large: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-6xl'
  };

  // Jednotná tmavě šedo-modrá barva
  const blockColor = {
    bg: '#475569', // slate-600 - tmavě šedo-modrá
    text: '#ffffff' // bílý text
  };

  return (
    <motion.div 
      className={`${sizeClasses[size]} rounded-xl relative flex items-center justify-center font-bold ${className}`}
      style={{
        backgroundColor: blockColor.bg,
        color: blockColor.text,
        border: `3px solid #334155`
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Číslo */}
      <div className="relative z-10">
        {value}
      </div>
      
      {/* Accessibility: Hidden number for screen readers */}
      <span className="sr-only">Číslo {value}</span>
    </motion.div>
  );
}

// Export barevné palety pro použití v jiných komponentách
export { NUMBER_COLORS };