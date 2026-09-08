import React from 'react';
import { motion } from 'motion/react';

interface DiceBlockProps {
  value: number;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  color?: string;
}

// Barevná paleta pro kostky
const DICE_COLORS = [
  { bg: '#ef4444', border: '#dc2626', highlight: '#f87171' }, // červená
  { bg: '#3b82f6', border: '#2563eb', highlight: '#60a5fa' }, // modrá
  { bg: '#22c55e', border: '#16a34a', highlight: '#4ade80' }, // zelená
  { bg: '#f59e0b', border: '#d97706', highlight: '#fbbf24' }, // oranžová/žlutá
  { bg: '#8b5cf6', border: '#7c3aed', highlight: '#a78bfa' }, // fialová
  { bg: '#ec4899', border: '#db2777', highlight: '#f472b6' }, // růžová
  { bg: '#06b6d4', border: '#0891b2', highlight: '#22d3ee' }, // cyan
  { bg: '#84cc16', border: '#65a30d', highlight: '#a3e635' }, // lime
  { bg: '#f97316', border: '#ea580c', highlight: '#fb923c' }, // oranžová
  { bg: '#6366f1', border: '#4f46e5', highlight: '#818cf8' }, // indigo
];

export function DiceBlock({ value, size = 'large', className = '', color }: DiceBlockProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-28 h-28',
    xl: 'w-32 h-32'
  };

  const dotSizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  // Jednotná tmavě šedo-modrá barva
  const diceColor = {
    bg: '#475569', // slate-600 - tmavě šedo-modrá
    border: '#334155', // slate-700 - tmavší border
    highlight: '#64748b' // slate-500 - světlejší highlight
  };

  // Generate dot positions based on dice value
  const getDotPositions = (value: number) => {
    const positions: { row: number; col: number }[] = [];
    
    switch (value) {
      case 1:
        positions.push({ row: 1, col: 1 }); // center
        break;
      case 2:
        positions.push({ row: 0, col: 2 }); // top-right
        positions.push({ row: 2, col: 0 }); // bottom-left
        break;
      case 3:
        positions.push({ row: 0, col: 2 }); // top-right
        positions.push({ row: 1, col: 1 }); // center
        positions.push({ row: 2, col: 0 }); // bottom-left
        break;
      case 4:
        positions.push({ row: 0, col: 0 }); // top-left
        positions.push({ row: 0, col: 2 }); // top-right
        positions.push({ row: 2, col: 0 }); // bottom-left
        positions.push({ row: 2, col: 2 }); // bottom-right
        break;
      case 5:
        positions.push({ row: 0, col: 0 }); // top-left
        positions.push({ row: 0, col: 2 }); // top-right
        positions.push({ row: 1, col: 1 }); // center
        positions.push({ row: 2, col: 0 }); // bottom-left
        positions.push({ row: 2, col: 2 }); // bottom-right
        break;
      case 6:
        positions.push({ row: 0, col: 0 }); // top-left
        positions.push({ row: 0, col: 2 }); // top-right
        positions.push({ row: 1, col: 0 }); // middle-left
        positions.push({ row: 1, col: 2 }); // middle-right
        positions.push({ row: 2, col: 0 }); // bottom-left
        positions.push({ row: 2, col: 2 }); // bottom-right
        break;
      default:
        break;
    }
    
    return positions;
  };

  const dotPositions = getDotPositions(value);

  return (
    <motion.div 
      className={`${sizeClasses[size]} rounded-xl shadow-md relative ${className}`}
      style={{
        backgroundColor: diceColor.bg,
        border: `2px solid ${diceColor.border}`
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Jemný highlight pro hloubku */}
      <div 
        className="absolute inset-x-2 top-1 h-2 rounded-t-lg opacity-60"
        style={{ backgroundColor: diceColor.highlight }}
      />
      
      {/* 3x3 grid for dot positioning */}
      <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-0">
        {Array.from({ length: 9 }).map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const hasDot = dotPositions.some(pos => pos.row === row && pos.col === col);
          
          return (
            <div key={index} className="flex items-center justify-center">
              {hasDot && (
                <motion.div 
                  className={`${dotSizeClasses[size]} bg-white rounded-full shadow-sm`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Accessibility: Hidden number for screen readers */}
      <span className="sr-only">{value}</span>
    </motion.div>
  );
}

// Export barevné palety pro použití v jiných komponentách
export { DICE_COLORS };