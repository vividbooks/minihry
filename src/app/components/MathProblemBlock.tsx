import React from 'react';
import { motion } from 'motion/react';

interface MathProblemBlockProps {
  num1: number;
  num2: number;
  operation: '+' | '-';
  size?: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  className?: string;
  colorIndex?: number;
}

// Barevná paleta pro matematické bloky
const MATH_COLORS = [
  { bg: '#6366f1', text: '#ffffff', border: '#4f46e5' }, // indigo
  { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed' }, // fialová
  { bg: '#ec4899', text: '#ffffff', border: '#db2777' }, // růžová
  { bg: '#ef4444', text: '#ffffff', border: '#dc2626' }, // červená
  { bg: '#f59e0b', text: '#ffffff', border: '#d97706' }, // oranžová
  { bg: '#22c55e', text: '#ffffff', border: '#16a34a' }, // zelená
  { bg: '#06b6d4', text: '#ffffff', border: '#0891b2' }, // cyan
  { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' }, // modrá
];

export function MathProblemBlock({ num1, num2, operation, size = 'large', className = '', colorIndex = 0 }: MathProblemBlockProps) {
  const sizeClasses = {
    small: 'w-20 h-16 text-xl',
    medium: 'w-24 h-20 text-2xl',
    large: 'w-28 h-24 text-3xl',
    xl: 'w-36 h-32 text-6xl',
    xxl: 'w-48 h-44 text-5xl' // Extra velká kostka s rozumnou velikostí textu
  };

  // Jednotná tmavě šedo-modrá barva
  const mathColor = {
    bg: '#475569', // slate-600 - tmavě šedo-modrá
    text: '#ffffff', // bílý text
    border: '#334155' // slate-700 - tmavší border
  };

  // Vypočítej výsledek
  const result = operation === '+' ? num1 + num2 : num1 - num2;

  return (
    <motion.div 
      className={`${sizeClasses[size]} rounded-xl shadow-md relative flex flex-col items-center justify-center font-bold ${className}`}
      style={{
        backgroundColor: mathColor.bg,
        color: mathColor.text,
        border: `3px solid ${mathColor.border}`,
        boxShadow: `0 4px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)`
      }}
      whileHover={{ scale: 1.05 }}
    >

      
      {/* Matematický příklad */}
      <div className="relative z-10 text-center leading-none flex flex-col items-center justify-center h-full">
        <div className="whitespace-nowrap">{num1} {operation} {num2}</div>
      </div>
      
      {/* Accessibility: Hidden math problem for screen readers */}
      <span className="sr-only">
        Příklad {num1} {operation === '+' ? 'plus' : 'mínus'} {num2} rovná se {result}
      </span>
    </motion.div>
  );
}

// Funkce pro generování náhodného příkladu
export function generateMathProblem(difficulty: 1 | 2 | 3): { num1: number; num2: number; operation: '+' | '-'; result: number } {
  let num1: number;
  let num2: number;
  const operation: '+' | '-' = '+'; // Jen sčítání

  // Pouze sčítání do 10
  num1 = Math.floor(Math.random() * 6) + 1; // 1-6
  num2 = Math.floor(Math.random() * (10 - num1)) + 1; // Aby součet byl max 10

  const result = num1 + num2;
  
  return { num1, num2, operation, result };
}

// Export barevné palety pro použití v jiných komponentách
export { MATH_COLORS };