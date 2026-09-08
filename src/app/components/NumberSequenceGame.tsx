import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion, AnimatePresence } from 'motion/react';
import { isTouchDevice, ScreenSize, updateScreenSize } from '../utils/deviceDetection';
import { GameResultScreen } from './GameResultScreen';
import { useAudio } from './AudioManager';
import { COLORS as PALETTE_COLORS } from '../constants/gameData';

// Robotické barevné schéma podle dokumentace
const COLORS = {
  PAGE_BG: "#F5E6D0",        // Světle béžová (sjednoceno s NumberRecognitionGame)
  SLOT_BG: "#FFFFFF",        // Bílé sloty
  SLOT_LINE: "#C0C4FF",      // Světle modrá ohraničení
  DRAGGABLE_BG: "#F0F9FF",   // Světle modrá pro drag prvky
  DRAGGABLE_BORDER: "#4EA3FF", // Modrá border
  HOVER_BG: "#FEF3CD",       // Žlutá hover
  SUCCESS_BG: "#4CAF50",     // Zelená úspěch
  CRIMSON: "#9B1C1C",        // Tmavě červená text
  BLUE: "#4EA3FF",           // Modrá tlačítka
  GREEN: "#4CAF50",          // Zelená progress
  PURPLE: "#7E57C2",         // Fialová accent
  RED: "#FF4D6D",            // Červená chyby
  ORANGE: "#F7A800",         // Oranžová reset
  GRAY: "#B0B0B0",           // Šedá neaktivní
  FILLED_BG: "#E8F5E8",      // Světle zelená vyplněné
  FILLED_BORDER: "#4CAF50"   // Zelená border vyplněné
};

interface Position {
  x: number;
  y: number;
  rotation: number;
}

interface SequenceSpec {
  sequence: number[];
  missing: number[];
  title: string;
  description: string;
}

interface GameSettings {
  cardTypes?: string[];
  sequenceTypes?: string[];
  sequenceLength?: [number, number];
  missingCount?: [number, number];
  numberRange?: [number, number];
}

interface NumberSequenceGameProps {
  settings?: GameSettings;
  onSwitchGame?: () => void;
}

// 20+ variant číselných řad podle dokumentace
const SEQUENCE_VARIANTS = [
  // Vzestupné řady
  { sequence: [1,2,3,4,5,6,7,8,9,10], title: "Číselná řada 1-10" },
  { sequence: [0,1,2,3,4,5,6,7], title: "Číselná řada 0-7" },
  { sequence: [2,3,4,5,6,7,8,9], title: "Číselná řada 2-9" },
  { sequence: [3,4,5,6,7,8,9,10,11], title: "Číselná řada 3-11" },
  
  // Sestupné řady
  { sequence: [10,9,8,7,6,5,4,3,2,1], title: "Sestupná řada 10-1" },
  { sequence: [8,7,6,5,4,3,2,1,0], title: "Sestupná řada 8-0" },
  { sequence: [12,11,10,9,8,7,6,5], title: "Sestupná řada 12-5" },
  
  // Sudá čísla
  { sequence: [0,2,4,6,8,10], title: "Sudá čísla 0-10" },
  { sequence: [2,4,6,8,10,12], title: "Sudá čísla 2-12" },
  { sequence: [4,6,8,10,12,14], title: "Sudá čísla 4-14" },
  
  // Lichá čísla
  { sequence: [1,3,5,7,9], title: "Lichá čísla 1-9" },
  { sequence: [1,3,5,7,9,11], title: "Lichá čísla 1-11" },
  { sequence: [3,5,7,9,11,13], title: "Lichá čísla 3-13" },
  
  // Násobky
  { sequence: [0,5,10,15,20,25], title: "Násobky čísla 5" },
  { sequence: [0,3,6,9,12,15], title: "Násobky čísla 3" },
  { sequence: [0,4,8,12,16,20], title: "Násobky čísla 4" },
  { sequence: [0,6,12,18,24,30], title: "Násobky čísla 6" },
  { sequence: [0,7,14,21,28,35], title: "Násobky čísla 7" },
  
  // Pokročilé řady
  { sequence: [1,4,7,10,13,16], title: "Řada +3 od 1" },
  { sequence: [2,5,8,11,14,17], title: "Řada +3 od 2" },
  { sequence: [1,2,4,8,16,32], title: "Mocniny dvojky" },
  { sequence: [1,1,2,3,5,8], title: "Fibonacciho řada" },
  { sequence: [1,4,9,16,25,36], title: "Druhé mocniny" }
];

// Inteligentní algoritmus generování chybějících čísel podle dokumentace
const generateMissingNumbers = (sequence: number[]): number[] => {
  const sequenceLength = sequence.length;
  let missingCount: number;
  
  // Dynamické určení počtu chybějících čísel
  if (sequenceLength <= 6) {
    missingCount = 3 + Math.floor(Math.random() * 2); // 3-4 chybí
  } else if (sequenceLength <= 8) {
    missingCount = 4 + Math.floor(Math.random() * 2); // 4-5 chybí  
  } else {
    missingCount = 5 + Math.floor(Math.random() * 3); // 5-7 chybí
  }
  
  let missing: number[] = [];
  
  // Ochrana první a poslední pozice pro logiku
  const possibleIndices = [];
  for (let i = 1; i < sequenceLength - 1; i++) {
    possibleIndices.push(i);
  }
  
  // Náhodný výběr pozic
  while (missing.length < Math.min(missingCount, possibleIndices.length)) {
    const randomIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
    if (!missing.includes(randomIndex)) {
      missing.push(randomIndex);
    }
  }
  
  // Zajištění minimálně 3 chybějících čísel
  while (missing.length < 3 && missing.length < sequenceLength - 2) {
    const middleIndex = 1 + Math.floor(Math.random() * (sequenceLength - 2));
    if (!missing.includes(middleIndex)) {
      missing.push(middleIndex);
    }
  }
  
  return missing.sort((a, b) => a - b);
};

// Pomocné funkce pro aplikaci nastavení
const determineSequenceType = (sequence: number[]): string => {
  if (sequence.length < 2) return 'other';
  
  const diff = sequence[1] - sequence[0];
  
  // Vzestupná/sestupná řada
  if (Math.abs(diff) === 1) {
    return diff > 0 ? 'ascending' : 'descending';
  }
  
  // Sudá/lichá čísla
  if (diff === 2) {
    return sequence[0] % 2 === 0 ? 'even' : 'odd';
  }
  
  // Násobky - specifické kontroly
  if (sequence[0] === 0 && diff > 2) {
    if (diff === 3) return 'multiples3';
    if (diff === 4) return 'multiples4';
    if (diff === 5) return 'multiples5';
    if (diff === 6) return 'multiples6';
    if (diff === 7) return 'multiples7';
    return 'multiples';
  }
  
  // Jiné vzory
  return 'other';
};

const generateCustomSequence = (baseVariant: any, targetLength: number): any => {
  const baseSequence = baseVariant.sequence;
  if (baseSequence.length >= targetLength) {
    return {
      ...baseVariant,
      sequence: baseSequence.slice(0, targetLength)
    };
  }
  
  // Rozšíření sekvence podle vzoru
  const diff = baseSequence.length > 1 ? baseSequence[1] - baseSequence[0] : 1;
  const newSequence = [...baseSequence];
  
  while (newSequence.length < targetLength) {
    const lastValue = newSequence[newSequence.length - 1];
    newSequence.push(lastValue + diff);
  }
  
  return {
    ...baseVariant,
    sequence: newSequence
  };
};

const generateCustomMissingNumbers = (sequence: number[], targetCount: number): number[] => {
  const sequenceLength = sequence.length;
  const maxMissing = Math.min(targetCount, sequenceLength - 2); // Ponech začátek a konec
  
  const missing: number[] = [];
  const possibleIndices = [];
  
  // Ochrana první a poslední pozice
  for (let i = 1; i < sequenceLength - 1; i++) {
    possibleIndices.push(i);
  }
  
  // Náhodný výběr pozic
  while (missing.length < maxMissing && possibleIndices.length > 0) {
    const randomIndex = Math.floor(Math.random() * possibleIndices.length);
    const selectedIndex = possibleIndices[randomIndex];
    missing.push(selectedIndex);
    possibleIndices.splice(randomIndex, 1);
  }
  
  return missing.sort((a, b) => a - b);
};

// Helper function to get random color from palette
// Pro handwritten (tmavá SVG) použijeme světlé pastelové barvy
// Pro dots a standard použijeme sytější barvy
const getRandomCardColor = (cardType: 'standard' | 'handwritten' | 'dots'): string => {
  if (cardType === 'handwritten') {
    // Světlé pastelové barvy pro tmavá SVG čísla
    const lightColors = [
      '#A8E6CF', // světle zelená
      '#FFE5A0', // světle žlutá
      '#D4B5F7', // světle fialová
      '#FFB3C1', // světle růžová
      '#B3D9FF', // světle modrá
      '#FFD4A3', // světle oranžová
    ];
    return lightColors[Math.floor(Math.random() * lightColors.length)];
  } else {
    // Sytější barvy pro bílý text/tečky
    const vibrantColors = [
      '#4CAF50', // zelená
      '#F2D602', // žlutá
      '#7E57C2', // fialová
      '#FF4D6D', // červená / růžová
      '#4EA3FF', // modrá
      '#F7A800', // oranžová
    ];
    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
  }
};

// Helper function to get SVG URLs for number digits
const getNumberSvgUrls = (num: number): string[] => {
  const digits = num.toString().split('');
  return digits.map(digit => 
    `https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/cisla/${digit}.svg`
  );
};

// Helper function to get dice pattern for numbers 0-12 (classic dice layout)
const getDicePattern = (num: number): string[] => {
  // Patterns for 0-12 using 3x3 grid (9 positions) - classic dice layout
  const patterns: { [key: number]: string[] } = {
    0: ['', '', '', '', '', '', '', '', ''],
    1: ['', '', '', '', '●', '', '', '', ''],
    2: ['●', '', '', '', '', '', '', '', '●'],
    3: ['●', '', '', '', '●', '', '', '', '●'],
    4: ['●', '', '●', '', '', '', '●', '', '●'],
    5: ['●', '', '●', '', '●', '', '●', '', '●'],
    6: ['●', '', '●', '●', '', '●', '●', '', '●'],
    7: ['●', '', '●', '●', '●', '●', '●', '', '●'],
    8: ['●', '●', '●', '', '●', '', '●', '●', '●'],
    9: ['●', '●', '●', '●', '●', '●', '●', '●', '●'],
    10: ['●', '●', '●', '●', '●', '●', '●', '●', '●'], // Plné + extra označení
    11: ['●', '●', '●', '●', '●', '●', '●', '●', '●'],
    12: ['●', '●', '●', '●', '●', '●', '●', '●', '●']
  };
  return patterns[num] || patterns[0];
};

// Draggable Number Component
interface DraggableNumberProps {
  number: number;
  id: string;
  onDrop: () => void;
  style: React.CSSProperties;
  size: number;
  cardType: 'standard' | 'handwritten' | 'dots';
  cardColor?: string;
}

const DraggableNumber: React.FC<DraggableNumberProps> = ({ number, id, onDrop, style, size, cardType, cardColor }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'number',
    item: { number, id },
    end: (item, monitor) => {
      if (monitor.didDrop()) onDrop();
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [number, id, onDrop]);
  
  const containerSize = Math.floor(size * 2.5);
  const svgUrls = cardType === 'handwritten' ? getNumberSvgUrls(number) : [];
  const dicePattern = cardType === 'dots' && number >= 0 && number <= 12 ? getDicePattern(number) : [];
  
  const bgColor = cardColor || COLORS.DRAGGABLE_BG;
  const textColor = cardColor || COLORS.CRIMSON;
  // Pro handwritten (světlé barvy) použijeme tmavší border, pro ostatní bílý
  const borderColor = cardColor ? (cardType === 'handwritten' ? '#9B1C1C' : '#ffffff') : COLORS.DRAGGABLE_BORDER;
  
  return (
    <div 
      ref={drag} 
      className="cursor-move select-none transition-all transform active:scale-95 absolute z-30 flex items-center justify-center" 
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: bgColor,
        border: `3px solid ${borderColor}`,
        borderRadius: '16px',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        fontSize: `${size}px`,
        fontWeight: 'bold',
        color: cardColor ? '#ffffff' : COLORS.CRIMSON,
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        gap: svgUrls.length > 1 ? '2px' : '0',
        ...style
      }}
    >
      {cardType === 'dots' && dicePattern.length > 0 ? (
        // Tečkový vzor (3x3 grid jako na hrací kostce)
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '8px',
          width: '75%',
          height: '75%',
          padding: '10px'
        }}>
          {dicePattern.map((dot, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {dot && (
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: cardColor ? '#ffffff' : COLORS.CRIMSON,
                    boxShadow: '0 3px 6px rgba(0,0,0,0.4)'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ) : cardType === 'handwritten' && svgUrls.length > 0 ? (
        // Psací číslice SVG
        svgUrls.map((url, idx) => (
          <img 
            key={idx}
            src={url} 
            alt=""
            style={{
              height: '84%',
              width: 'auto',
              maxWidth: svgUrls.length === 1 ? '84%' : '42%',
              objectFit: 'contain',
              pointerEvents: 'none'
            }}
          />
        ))
      ) : (
        // Standardní číslice
        number
      )}
    </div>
  );
};

// Drop Slot Component
interface DropSlotProps {
  index: number;
  number: number | null;
  expectedNumber?: number; // Očekávané číslo pro validaci
  onDrop: (index: number, number: number) => void;
  onRemove: (index: number) => void;
  size: number;
  isMissing: boolean;
  cardType: 'standard' | 'handwritten' | 'dots';
  cardColor?: string;
}

const DropSlot: React.FC<DropSlotProps> = ({ index, number, expectedNumber, onDrop, onRemove, size, isMissing, cardType, cardColor }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'number',
    drop: (item: { number: number; id: string }) => {
      if (isMissing) {
        onDrop(index, item.number);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }), [index, isMissing, onDrop]);
  
  const isEmpty = number === null && isMissing;
  const isCorrect = number !== null && expectedNumber !== undefined && number === expectedNumber;
  const isIncorrect = number !== null && expectedNumber !== undefined && number !== expectedNumber;
  
  const backgroundColor = isEmpty ? 
    (isOver ? COLORS.HOVER_BG : COLORS.SLOT_BG) : 
    isMissing ? 
      (isCorrect ? COLORS.FILLED_BG : isIncorrect ? '#FFE4E1' : (cardColor || COLORS.SLOT_BG)) : 
      (cardColor || COLORS.SLOT_BG);
  
  // Pro handwritten (světlé barvy) použijeme tmavší border, pro ostatní bílý
  const slotBorderColor = cardColor ? (cardType === 'handwritten' ? '#9B1C1C' : '#ffffff') : COLORS.SLOT_LINE;
  
  const border = isEmpty ? 
    `3px dashed ${COLORS.SLOT_LINE}` : 
    isMissing ? 
      (isCorrect ? `3px solid ${COLORS.FILLED_BORDER}` : isIncorrect ? `3px solid ${COLORS.RED}` : `3px solid ${slotBorderColor}`) :
      `3px solid ${slotBorderColor}`;
  
  const displayNumber = isMissing ? number : expectedNumber;
  const svgUrls = cardType === 'handwritten' && displayNumber !== null && displayNumber !== undefined ? getNumberSvgUrls(displayNumber) : [];
  const dicePattern = cardType === 'dots' && displayNumber !== null && displayNumber !== undefined && displayNumber >= 0 && displayNumber <= 12 ? getDicePattern(displayNumber) : [];
  
  return (
    <div
      ref={drop}
      className="flex items-center justify-center transition-all cursor-pointer"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        border,
        borderRadius: '12px',
        fontSize: `${Math.floor(size * 0.4)}px`,
        fontWeight: 'bold',
        color: isMissing ? COLORS.GREEN : (cardColor ? '#ffffff' : COLORS.CRIMSON),
        boxShadow: isEmpty ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
        gap: svgUrls.length > 1 ? '2px' : '0'
      }}
      onClick={() => {
        if (number !== null && isMissing) {
          onRemove(index);
        }
      }}
    >
      {isEmpty ? (
        '?'
      ) : cardType === 'dots' && dicePattern.length > 0 ? (
        // Tečkový vzor (3x3 grid jako na hrací kostce)
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: Math.floor(size * 0.05) + 'px',
          width: '75%',
          height: '75%',
          padding: Math.floor(size * 0.08) + 'px'
        }}>
          {dicePattern.map((dot, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {dot && (
                <div
                  style={{
                    width: Math.floor(size * 0.15) + 'px',
                    height: Math.floor(size * 0.15) + 'px',
                    borderRadius: '50%',
                    backgroundColor: isMissing ? COLORS.GREEN : (cardColor ? '#ffffff' : COLORS.CRIMSON),
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ) : cardType === 'handwritten' && svgUrls.length > 0 ? (
        // Psací číslice SVG
        svgUrls.map((url, idx) => (
          <img 
            key={idx}
            src={url} 
            alt=""
            style={{
              height: '84%',
              width: 'auto',
              maxWidth: svgUrls.length === 1 ? '84%' : '42%',
              objectFit: 'contain',
              pointerEvents: 'none'
            }}
          />
        ))
      ) : (
        // Standardní číslice
        isMissing ? (number ?? '?') : number
      )}
    </div>
  );
};

// Main Component
export function NumberSequenceGame({ settings = {}, onSwitchGame }: NumberSequenceGameProps) {
  const [currentSpec, setCurrentSpec] = useState<SequenceSpec>();
  const [userAnswers, setUserAnswers] = useState<Record<number, number | null>>({});
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [numberPositions, setNumberPositions] = useState<Position[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [showGameResult, setShowGameResult] = useState(false);
  const [lastAnswerWasCorrect, setLastAnswerWasCorrect] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentCardType, setCurrentCardType] = useState<'standard' | 'handwritten' | 'dots'>('handwritten'); // Jeden typ pro celé kolo
  const [currentRoundColor, setCurrentRoundColor] = useState<string>(''); // JEDNA barva pro celé kolo
  
  const { playSound } = useAudio();
  
  // Determine available card types from settings
  const availableCardTypes = useMemo(() => {
    const types = settings.cardTypes || ['handwritten'];
    return types;
  }, [settings.cardTypes]);
  
  // Get card type for current round - střídá typy mezi koly
  const getCardTypeForRound = useCallback((roundNumber: number): 'standard' | 'handwritten' | 'dots' => {
    if (availableCardTypes.length === 0) return 'handwritten';
    if (availableCardTypes.length === 1) {
      return availableCardTypes[0] as 'standard' | 'handwritten' | 'dots';
    }
    // Střídá mezi typy - kolo 1: první typ, kolo 2: druhý typ, kolo 3: první typ atd.
    const typeIndex = (roundNumber - 1) % availableCardTypes.length;
    return availableCardTypes[typeIndex] as 'standard' | 'handwritten' | 'dots';
  }, [availableCardTypes]);

  // Screen size detection
  useEffect(() => {
    return updateScreenSize(setScreenSize);
  }, []);

  // Maximální využití obrazovky podle dokumentace
  const slotSize = useMemo(() => {
    if (!currentSpec) return 80;
    
    const availableWidth = window.innerWidth;
    const sequenceLength = currentSpec.sequence.length;
    const gapSize = screenSize === 'mobile' ? 1 : screenSize === 'tablet' ? 2 : 3;
    const totalGapWidth = (sequenceLength - 1) * gapSize;
    const maxSlotWidth = Math.floor((availableWidth - totalGapWidth - 40) / sequenceLength);
    
    // Omezení velikosti podle screen size
    const maxSize = screenSize === 'mobile' ? 70 : screenSize === 'tablet' ? 90 : 120;
    const minSize = screenSize === 'mobile' ? 50 : screenSize === 'tablet' ? 60 : 70;
    
    return Math.max(minSize, Math.min(maxSize, maxSlotWidth));
  }, [currentSpec, screenSize]);

  const fontSize = useMemo(() => {
    const baseFontSize = screenSize === 'mobile' ? 
      Math.min(32, Math.max(20, slotSize * 0.5)) : 
      screenSize === 'tablet' ? 
      Math.min(42, Math.max(26, slotSize * 0.5)) : 
      Math.min(52, Math.max(32, slotSize * 0.5));
    
    return baseFontSize;
  }, [slotSize, screenSize]);

  // Generování nové varianty
  const generateNewVariant = useCallback(() => {
    // Zjistit rozsah čísel
    const [minNum, maxNum] = settings?.numberRange || [0, 20];
    
    // Zjistit povolené typy řad
    const allowedTypes = settings?.sequenceTypes && settings.sequenceTypes.length > 0 
      ? settings.sequenceTypes 
      : ['ascending', 'descending', 'even', 'odd', 'multiples3', 'multiples4', 'multiples5'];
    
    // Generovat sekvence dynamicky podle rozsahu a typu
    const availableVariants: Array<{ sequence: number[]; title: string }> = [];
    
    // Vzestupné řady
    if (allowedTypes.includes('ascending')) {
      if (maxNum - minNum >= 4) {
        availableVariants.push({
          sequence: Array.from({ length: maxNum - minNum + 1 }, (_, i) => minNum + i),
          title: `Číselná řada ${minNum}-${maxNum}`
        });
      }
    }
    
    // Sestupné řady
    if (allowedTypes.includes('descending')) {
      if (maxNum - minNum >= 4) {
        availableVariants.push({
          sequence: Array.from({ length: maxNum - minNum + 1 }, (_, i) => maxNum - i),
          title: `Sestupná řada ${maxNum}-${minNum}`
        });
      }
    }
    
    // Sudá čísla
    if (allowedTypes.includes('even')) {
      const evenStart = minNum % 2 === 0 ? minNum : minNum + 1;
      const evenNumbers = [];
      for (let i = evenStart; i <= maxNum; i += 2) {
        evenNumbers.push(i);
      }
      if (evenNumbers.length >= 4) {
        availableVariants.push({
          sequence: evenNumbers,
          title: `Sudá čísla ${evenStart}-${maxNum}`
        });
      }
    }
    
    // Lichá čísla
    if (allowedTypes.includes('odd')) {
      const oddStart = minNum % 2 === 1 ? minNum : minNum + 1;
      const oddNumbers = [];
      for (let i = oddStart; i <= maxNum; i += 2) {
        oddNumbers.push(i);
      }
      if (oddNumbers.length >= 4) {
        availableVariants.push({
          sequence: oddNumbers,
          title: `Lichá čísla ${oddStart}-${maxNum}`
        });
      }
    }
    
    // Násobky 3
    if (allowedTypes.includes('multiples3')) {
      const mult3 = [];
      for (let i = 0; i <= maxNum; i += 3) {
        if (i >= minNum) mult3.push(i);
      }
      if (mult3.length >= 4) {
        availableVariants.push({
          sequence: mult3,
          title: `Násobky čísla 3`
        });
      }
    }
    
    // Násobky 4
    if (allowedTypes.includes('multiples4')) {
      const mult4 = [];
      for (let i = 0; i <= maxNum; i += 4) {
        if (i >= minNum) mult4.push(i);
      }
      if (mult4.length >= 4) {
        availableVariants.push({
          sequence: mult4,
          title: `Násobky čísla 4`
        });
      }
    }
    
    // Násobky 5
    if (allowedTypes.includes('multiples5')) {
      const mult5 = [];
      for (let i = 0; i <= maxNum; i += 5) {
        if (i >= minNum) mult5.push(i);
      }
      if (mult5.length >= 4) {
        availableVariants.push({
          sequence: mult5,
          title: `Násobky čísla 5`
        });
      }
    }
    
    // Pokud žádné varianty, vytvoř alespoň vzestupnou řadu
    if (availableVariants.length === 0) {
      availableVariants.push({
        sequence: Array.from({ length: Math.min(10, maxNum - minNum + 1) }, (_, i) => minNum + i),
        title: `Číselná řada ${minNum}-${Math.min(minNum + 9, maxNum)}`
      });
    }
    
    let variant = availableVariants[Math.floor(Math.random() * availableVariants.length)];
    
    // Aplikace délky sekvence z nastavení - POUZE zkrátit nebo vybrat podsekvenci
    if (settings && settings.sequenceLength) {
      const [minLength, maxLength] = settings.sequenceLength;
      const targetLength = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
      
      if (variant.sequence.length > targetLength) {
        // Zkrátit sekvenci - vybrat náhodný úsek
        const maxStartIndex = variant.sequence.length - targetLength;
        const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
        variant = {
          ...variant,
          sequence: variant.sequence.slice(startIndex, startIndex + targetLength)
        };
      } else if (variant.sequence.length < targetLength) {
        // Sekvence je příliš krátká - použij ji celou
        // NEPRODLUŽUJ - to by mohlo jít mimo rozsah
      }
    }
    
    let missing = generateMissingNumbers(variant.sequence);
    
    // Aplikace počtu chybějících čísel z nastavení
    if (settings && settings.missingCount) {
      const [minMissing, maxMissing] = settings.missingCount;
      const targetMissing = minMissing + Math.floor(Math.random() * (maxMissing - minMissing + 1));
      missing = generateCustomMissingNumbers(variant.sequence, targetMissing);
    }
    
    const spec: SequenceSpec = {
      sequence: variant.sequence,
      missing,
      title: variant.title,
      description: `Doplň ${missing.length} chybějících čísel`
    };
    
    setCurrentSpec(spec);
    
    // Reset stavu
    const initialAnswers: Record<number, number | null> = {};
    missing.forEach(index => {
      initialAnswers[index] = null;
    });
    setUserAnswers(initialAnswers);
    setIsComplete(false);
    setShowSuccess(false);
    setShowGameResult(false);
    setLastAnswerWasCorrect(false);
    
    // Vytvoření seznamu dostupných čísel
    const missingNumbers = missing.map(index => variant.sequence[index]);
    const shuffledNumbers = [...missingNumbers].sort(() => Math.random() - 0.5);
    setAvailableNumbers(shuffledNumbers);
    
    // Nastavit typ kartiček pro aktuální kolo - VŠECHNY kartičky stejný typ
    const cardType = getCardTypeForRound(currentRound);
    setCurrentCardType(cardType);
    
    // Generování JEDNÉ náhodné barvy pro celé kolo - všechny kartičky stejná barva
    // Pro handwritten používáme světlé barvy (tmavá SVG čísla)
    const roundColor = getRandomCardColor(cardType);
    setCurrentRoundColor(roundColor);
    
  }, [settings, getCardTypeForRound, currentRound]);

  // Generování pozic pro přetažitelné prvky - stejně jako u PatternSequenceGame
  useEffect(() => {
    if (!currentSpec) return;
    
    const positions: Position[] = [];
    const count = availableNumbers.length;
    
    // Generování pozic rozházených po celé dolní ploše
    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let position: Position;
      
      do {
        position = {
          x: 10 + Math.random() * 80, // Rozsah 10-90% (více okraj)
          y: (screenSize === 'mobile' ? 60 : 55) + Math.random() * 35, // Rozsah 60-95% nebo 55-90%
          rotation: Math.random() * 40 - 20 // Rotace -20 až +20 stupňů
        };
        attempts++;
      } while (
        attempts < 50 && 
        positions.some(existingPos => 
          Math.abs(existingPos.x - position.x) < 12 && 
          Math.abs(existingPos.y - position.y) < 12
        )
      );
      
      positions.push(position);
    }
    
    setNumberPositions(positions);
  }, [currentSpec, availableNumbers.length, screenSize]);

  // Inicializace při prvním načtení - jen jednou
  useEffect(() => {
    generateNewVariant();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Přegenerování při změně nastavení
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      generateNewVariant();
    }
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Aktualizace typu kartiček při změně kola
  useEffect(() => {
    const cardType = getCardTypeForRound(currentRound);
    setCurrentCardType(cardType);
  }, [currentRound, getCardTypeForRound]);

  // Drop handler
  const handleDrop = useCallback((slotIndex: number, number: number) => {
    setUserAnswers(prev => ({ ...prev, [slotIndex]: number }));
    
    const numberIndex = availableNumbers.findIndex(n => n === number);
    setAvailableNumbers(prev => prev.filter(n => n !== number));
    
    if (numberIndex !== -1) {
      setNumberPositions(prev => prev.filter((_, index) => index !== numberIndex));
    }
  }, [availableNumbers]);

  // Remove handler
  const handleRemoveNumber = useCallback((slotIndex: number) => {
    const removedNumber = userAnswers[slotIndex];
    if (removedNumber !== null && removedNumber !== undefined) {
      setUserAnswers(prev => ({ ...prev, [slotIndex]: null }));
      setAvailableNumbers(prev => [...prev, removedNumber]);
      
      // Najít novou pozici
      const newPosition: Position = {
        x: 10 + Math.random() * 80,
        y: (screenSize === 'mobile' ? 60 : 55) + Math.random() * 35,
        rotation: Math.random() * 40 - 20
      };
      
      setNumberPositions(prev => [...prev, newPosition]);
    }
  }, [userAnswers, screenSize]);
  
  // Handler pro pokračování po GameResultScreen
  const handleContinue = useCallback(() => {
    setShowGameResult(false);
    
    if (lastAnswerWasCorrect) {
      // Správná odpověď - přejít na další kolo
      setIsComplete(true);
      setCurrentRound(prev => prev + 1);
      setTimeout(() => {
        setIsComplete(false);
        generateNewVariant();
      }, 500);
    } else {
      // Špatná odpověď - zůstat na stejném kole, nechat uživatele opravit
      // Pouze zavřít overlay
    }
  }, [lastAnswerWasCorrect, generateNewVariant]);

  // Kontrola dokončení
  useEffect(() => {
    if (!currentSpec) return;
    
    const allFilled = currentSpec.missing.every(index => userAnswers[index] !== null);
    const allCorrect = currentSpec.missing.every(index => 
      userAnswers[index] === currentSpec.sequence[index]
    );
    
    if (allFilled) {
      // Počkat chvíli, ať uživatel vidí sestavenou řadu
      setTimeout(() => {
        setLastAnswerWasCorrect(allCorrect);
        setShowGameResult(true);
        
        if (allCorrect) {
          playSound('correct');
        } else {
          playSound('incorrect');
        }
      }, 1500); // 1.5s delay před zobrazením GameResultScreen
    }
  }, [userAnswers, currentSpec, playSound]); // eslint-disable-line react-hooks/exhaustive-deps

  // Progress calculation
  const progress = useMemo(() => {
    if (!currentSpec) return 0;
    const filledCorrect = currentSpec.missing.filter(index => 
      userAnswers[index] === currentSpec.sequence[index]
    ).length;
    return (filledCorrect / currentSpec.missing.length) * 100;
  }, [userAnswers, currentSpec]);

  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  if (!currentSpec) {
    return <div>Načítání...</div>;
  }

  return (
    <DndProvider backend={backend}>
      <div className="w-full h-screen flex flex-col" style={{ backgroundColor: COLORS.PAGE_BG }}>
        {/* Header ve stylu NumberRecognitionGame */}
        <div className="w-full py-6 px-4" style={{ backgroundColor: COLORS.PAGE_BG }}>
          <div className="flex flex-col items-center space-y-4 max-w-4xl mx-auto">
            {/* Velký název nahoře */}
            <h1 className="text-5xl md:text-6xl font-bold text-[#4e5871] text-center">
              Číselné řady
            </h1>
            
            {/* Spodní řádek - Kolo a tlačítka */}
            <div className="flex items-center justify-between w-full max-w-2xl">
              {/* Kolo vlevo */}
              <div className="text-xl md:text-2xl font-medium text-[#4e5871] flex-1 text-left">
                Kolo {currentRound}
              </div>
              
              {/* Progress bar uprostřed */}
              <div className="flex-1 flex justify-center">
                {!isComplete && (
                  <div className="w-32 sm:w-40 md:w-48 rounded-full h-4 bg-gray-300">
                    <div className="h-4 rounded-full transition-all duration-300"
                         style={{
                           backgroundColor: COLORS.GREEN,
                           width: `${progress}%`
                         }} />
                  </div>
                )}
              </div>
              
              {/* Tlačítka vpravo */}
              <div className="flex gap-2 flex-1 justify-end">
                <button 
                  onClick={generateNewVariant} 
                  className="rounded-lg transition-all shadow-lg text-sm px-3 py-2"
                  style={{ 
                    backgroundColor: COLORS.PURPLE, 
                    color: 'white', 
                    fontWeight: 'bold'
                  }}
                >
                  🎲 Nový vzor
                </button>
                
                {onSwitchGame && (
                  <button 
                    onClick={onSwitchGame} 
                    className="rounded-lg transition-all shadow-lg text-sm px-3 py-2"
                    style={{ 
                      backgroundColor: COLORS.BLUE, 
                      color: 'white', 
                      fontWeight: 'bold'
                    }}
                  >
                    🔶 Vzory
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hlavní herní oblast */}
        <div className="flex-1 px-4 relative">
          <div className="max-w-7xl mx-auto h-full">
            {/* Sekvence nahoře */}
            <div className="flex items-center justify-center py-8">
              <div className="flex justify-center items-center gap-1 sm:gap-2 md:gap-3 overflow-x-auto">
                {currentSpec.sequence.map((number, index) => {
                  return (
                    <DropSlot
                      key={index}
                      index={index}
                      number={currentSpec.missing.includes(index) ? userAnswers[index] : number}
                      expectedNumber={number}
                      onDrop={handleDrop}
                      onRemove={handleRemoveNumber}
                      size={slotSize}
                      isMissing={currentSpec.missing.includes(index)}
                      cardType={currentCardType}
                      cardColor={currentRoundColor}
                    />
                  );
                })}
              </div>
            </div>

            {/* Přetažitelné prvky - rozházené po celé dolní ploše jako u PatternSequenceGame */}
            <div className="relative" style={{ minHeight: '200px' }}>
              {availableNumbers.map((number, index) => {
                const position = numberPositions[index];
                if (!position) return null;
                
                return (
                  <DraggableNumber
                    key={`${number}-${index}`}
                    number={number}
                    id={`${number}-${index}`}
                    onDrop={() => {}}
                    size={fontSize}
                    cardType={currentCardType}
                    cardColor={currentRoundColor}
                    style={{
                      position: 'absolute',
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `rotate(${position.rotation}deg)`
                    }}
                  />
                );
              })}
            </div>
            
            {/* Reset tlačítko dole */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  // Reset všech odpovědí
                  const resetAnswers: Record<number, number | null> = {};
                  currentSpec.missing.forEach(index => {
                    resetAnswers[index] = null;
                  });
                  setUserAnswers(resetAnswers);
                  
                  // Vrátit všechna čísla
                  const allNumbers = currentSpec.missing.map(index => currentSpec.sequence[index]);
                  setAvailableNumbers([...allNumbers].sort(() => Math.random() - 0.5));
                }}
                className="rounded-lg transition-all shadow-lg px-6 py-3"
                style={{ 
                  backgroundColor: COLORS.ORANGE, 
                  color: 'white', 
                  fontWeight: 'bold'
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* GameResultScreen s videem */}
        <AnimatePresence>
          {showGameResult && (
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
              <GameResultScreen
                isSuccess={lastAnswerWasCorrect}
                onContinue={handleContinue}
                autoHideDuration={3}
                successText={lastAnswerWasCorrect ? 
                  ['Skvělé! 🎯', 'Výborně! ⭐', 'Perfektní! 🏆', 'Úžasné! 🌟'][Math.floor(Math.random() * 4)] :
                  undefined
                }
                failureText={!lastAnswerWasCorrect ? 
                  ['Zkus to znovu! 🤔', 'Málem! 💪', 'Další pokus! 🎲', 'Zvládneš to! 🌟'][Math.floor(Math.random() * 4)] :
                  undefined
                }
                showContinueButton={false}
                displayType="gameComplete"
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}