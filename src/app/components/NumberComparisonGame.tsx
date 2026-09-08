import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameResultScreen } from './GameResultScreen';

// Barevné schéma
const COLORS = {
  PAGE_BG: '#F5E6D0', // Béžové pozadí
  
  // Modrá krabice (větší než)
  BLUE_FRONT: '#A8D5FF',
  BLUE_BACK: '#5B9BD5',
  BLUE_BORDER: '#3B7BA9',
  
  // Oranžová krabice (rovná se)
  ORANGE_FRONT: '#FFD5A8',
  ORANGE_BACK: '#E89B5B',
  ORANGE_BORDER: '#C17A3B',
  
  // Zelená krabice (menší než)
  GREEN_FRONT: '#B8E6B8',
  GREEN_BACK: '#6FBF6F',
  GREEN_BORDER: '#4A9F4A',
  
  TEXT: '#7C3A2A', // Tmavě hnědý text
  CARD_BG: '#FFFFFF', // Bílé kartičky
  CARD_BORDER: '#D4A574', // Světle hnědý border kartiček
  PROGRESS_BG: '#D9D9D9',
  PROGRESS_FILL: '#4CAF50',
  HEART_FULL: '#FF4D6D',
  HEART_EMPTY: '#D9D9D9',
};

// Emoji pro reprezentaci objektů
const EMOJIS = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍒', '⭐', '🌟', '💎', '🎈'];

// Herní nastavení
const TOTAL_ROUNDS = 5; // Jedno kolo = 5 tahů

// Typy číselných reprezentací
type RepresentationType = 'objects' | 'dice' | 'number' | 'math';

// Typ porovnání
type ComparisonType = 'greater' | 'equal' | 'less';

// Komponenta krabice podle designu
interface BoxProps {
  type: ComparisonType;
  referenceNumber: number;
  size?: number;
  onClick?: () => void;
  isHighlighted?: boolean;
}

const Box: React.FC<BoxProps> = ({ type, referenceNumber, size = 260, onClick, isHighlighted }) => {
  // Výběr barev podle typu
  const colors = {
    greater: { front: COLORS.BLUE_FRONT, back: COLORS.BLUE_BACK, border: COLORS.BLUE_BORDER },
    equal: { front: COLORS.ORANGE_FRONT, back: COLORS.ORANGE_BACK, border: COLORS.ORANGE_BORDER },
    less: { front: COLORS.GREEN_FRONT, back: COLORS.GREEN_BACK, border: COLORS.GREEN_BORDER },
  }[type];

  const width = size;
  const height = size;
  const backHeight = height * 0.35; // Horní část (zadek) - 35%
  const frontHeight = height * 0.75; // Dolní část (přední) - 75%
  const overlap = height * 0.1; // Překryv mezi částmi
  
  // Responsive border a font podle velikosti
  const borderWidth = size < 150 ? 2 : size < 200 ? 3 : 4;
  const fontSize = size < 150 ? size * 0.35 : size * 0.4;
  const gap = size < 150 ? '4px' : '8px';

  // Symbol podle typu
  const symbol = {
    greater: '>',
    equal: '=',
    less: '<',
  }[type];

  return (
    <div 
      className="relative flex flex-col items-center gap-4 cursor-pointer transition-all duration-300"
      onClick={onClick}
      style={{
        transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Krabice */}
      <div
        className="relative flex items-center justify-center"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          filter: isHighlighted ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
        }}
      >
        {/* Přední část (spodní vrstva) - světlejší, se znaménkem a číslem - MUSÍ BÝT PRVNÍ (nejnižší z-index) */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: `${width}px`,
            height: `${frontHeight}px`,
            backgroundColor: colors.front,
            borderRadius: size < 200 ? '8px 8px 16px 16px' : '12px 12px 24px 24px',
            top: `${backHeight - overlap}px`,
            left: 0,
            border: `${borderWidth}px solid ${colors.border}`,
            zIndex: 1,
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: gap,
              fontSize: `${fontSize}px`,
              color: colors.border,
              fontWeight: 'bold',
            }}
          >
            <span>{symbol}</span>
            <span>{referenceNumber}</span>
          </div>
        </div>
        
        {/* Zadní část (horní vrstva) - tmavší - MUSÍ BÝT POSLEDNÍ (nejvyšší z-index) */}
        <div
          className="absolute"
          style={{
            width: `${width}px`,
            height: `${backHeight}px`,
            backgroundColor: colors.back,
            borderRadius: size < 200 ? '12px' : '16px',
            top: 0,
            left: 0,
            border: `${borderWidth}px solid ${colors.border}`,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
};

// Komponenta kartičky s reprezentací čísla
interface NumberCardProps {
  type: RepresentationType;
  value: number;
  size?: number;
  emoji?: string; // Pro 'objects' typ
  mathExpression?: { a: number; b: number }; // Pro 'math' typ
}

const NumberCard: React.FC<NumberCardProps> = ({ type, value, size = 120, emoji, mathExpression }) => {
  const renderContent = () => {
    switch (type) {
      case 'objects': {
        // Zobrazení objektů (emoji) - použijeme emoji z props
        const displayEmoji = emoji || EMOJIS[0]; // Fallback na první emoji
        const emojiSize = size < 100 ? size * 0.25 : size * 0.2;
        const gapSize = size < 100 ? '2px' : '4px';
        const padding = size < 100 ? '4px' : '8px';
        return (
          <div 
            className="flex flex-wrap items-center justify-center"
            style={{ gap: gapSize, padding: padding }}
          >
            {Array.from({ length: value }).map((_, i) => (
              <span key={i} style={{ fontSize: `${emojiSize}px`, lineHeight: 1 }}>
                {displayEmoji}
              </span>
            ))}
          </div>
        );
      }
      
      case 'dice': {
        // Zobrazení puntíků jako na kostce
        return (
          <div className="flex items-center justify-center">
            <DiceFace value={value} size={size * 0.7} />
          </div>
        );
      }
      
      case 'number': {
        // Pouze číslo
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              fontSize: `${size * 0.5}px`,
              fontWeight: 'bold',
              color: COLORS.TEXT,
            }}
          >
            {value}
          </div>
        );
      }
      
      case 'math': {
        // Matematický příklad (např. 2+3) - použijeme mathExpression z props
        const a = mathExpression?.a ?? 1;
        const b = mathExpression?.b ?? (value - 1);
        const mathFontSize = size < 100 ? size * 0.4 : size * 0.35;
        return (
          <div 
            className="flex items-center justify-center"
            style={{ 
              fontSize: `${mathFontSize}px`,
              fontWeight: 'bold',
              color: COLORS.TEXT,
              gap: size < 100 ? '2px' : '4px',
            }}
          >
            <span>{a}</span>
            <span>+</span>
            <span>{b}</span>
          </div>
        );
      }
    }
  };

  return (
    <div 
      className="flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: COLORS.CARD_BG,
        border: `${size < 100 ? 2 : 3}px solid ${COLORS.CARD_BORDER}`,
        borderRadius: size < 100 ? '8px' : '12px',
        boxShadow: size < 100 ? '0 2px 4px rgba(0,0,0,0.15)' : '0 4px 8px rgba(0,0,0,0.15)',
      }}
    >
      {renderContent()}
    </div>
  );
};

// Komponenta pro zobrazení puntíků na kostce
interface DiceFaceProps {
  value: number;
  size: number;
}

const DiceFace: React.FC<DiceFaceProps> = ({ value, size }) => {
  // Pro hodnoty větší než 6, zobrazíme více kostek
  if (value > 6) {
    const diceCount = Math.ceil(value / 6);
    const dicePerRow = Math.min(diceCount, 3);
    const diceSize = size / (dicePerRow + 0.5);
    const gap = diceSize * 0.15;
    
    return (
      <div 
        className="flex flex-wrap items-center justify-center"
        style={{ 
          gap: `${gap}px`,
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {Array.from({ length: diceCount }).map((_, i) => {
          const diceValue = i === diceCount - 1 ? value - (i * 6) : 6;
          return (
            <DiceFaceSingle key={i} value={diceValue} size={diceSize} />
          );
        })}
      </div>
    );
  }
  
  return <DiceFaceSingle value={value} size={size} />;
};

// Jednoduchá kostka pro hodnoty 1-6
const DiceFaceSingle: React.FC<DiceFaceProps> = ({ value, size }) => {
  const dotSize = size * 0.15;
  const positions: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 0.5, y: 0.5 }],
    2: [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.7 }],
    3: [{ x: 0.3, y: 0.3 }, { x: 0.5, y: 0.5 }, { x: 0.7, y: 0.7 }],
    4: [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.3, y: 0.7 }, { x: 0.7, y: 0.7 }],
    5: [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.7 }, { x: 0.7, y: 0.7 }],
    6: [{ x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.3, y: 0.75 }, { x: 0.7, y: 0.75 }],
  };

  const dots = positions[Math.min(value, 6)] || positions[1];

  return (
    <div
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'white',
        border: '2px solid #333',
        borderRadius: '8px',
      }}
    >
      {dots.map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: '#333',
            left: `${pos.x * size - dotSize / 2}px`,
            top: `${pos.y * size - dotSize / 2}px`,
          }}
        />
      ))}
    </div>
  );
};

// Feedback overlay
interface FeedbackOverlayProps {
  isCorrect: boolean;
  onComplete: () => void;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isCorrect, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center px-12 py-8 rounded-3xl"
        style={{
          backgroundColor: isCorrect ? '#4CAF50' : '#FF4D6D',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div 
          className="text-white"
          style={{ fontSize: '80px', marginBottom: '16px' }}
        >
          {isCorrect ? '✓' : '✗'}
        </div>
        <div 
          className="text-white"
          style={{ fontSize: '48px', fontWeight: 'bold' }}
        >
          {isCorrect ? 'SPRÁVNĚ!' : 'ZKUS ZNOVU!'}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hlavní komponenta hry
interface NumberComparisonGameProps {
  settings?: Record<string, any>;
}

export function NumberComparisonGame({ settings }: NumberComparisonGameProps) {
  // Načtení nastavení z konfigurace
  const numberRange = settings?.numberRange || [1, 9];
  const representationTypes = settings?.representationTypes || ['objects', 'dice', 'number', 'math'];
  const backgroundColor = settings?.backgroundColor || COLORS.PAGE_BG;
  
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  
  // Referenční číslo (stejné pro všechny krabice)
  const [referenceNumber, setReferenceNumber] = useState(Math.floor((numberRange[0] + numberRange[1]) / 2));

  // Aktuální kartička
  const [currentCard, setCurrentCard] = useState<{
    value: number;
    type: RepresentationType;
    targetBox: ComparisonType;
    emoji?: string; // Pro 'objects' typ
    mathExpression?: { a: number; b: number }; // Pro 'math' typ
  } | null>(null);

  // Pozice kartičky
  const [cardPosition, setCardPosition] = useState<'center' | 'greater' | 'equal' | 'less'>('center');
  
  // Stav animace zasunutí
  const [isSliding, setIsSliding] = useState(false);
  
  // Feedback
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null);
  
  // Výsledková obrazovka
  const [showGameResult, setShowGameResult] = useState(false);
  const [gameResultType, setGameResultType] = useState<'success' | 'failure'>('success');

  // Generování nové kartičky
  const generateNewCard = () => {
    // Vygenerovat nové referenční číslo z nastaveného rozsahu
    // Referenční číslo by mělo být uprostřed rozsahu, aby byly možné všechny tři porovnání
    const minRef = numberRange[0] + 1;
    const maxRef = numberRange[1] - 1;
    
    // Pokud je rozsah příliš úzký (např. [1,2] nebo [1,3]), použijeme celý rozsah
    const newReferenceNumber = minRef <= maxRef 
      ? Math.floor(Math.random() * (maxRef - minRef + 1)) + minRef
      : Math.floor((numberRange[0] + numberRange[1]) / 2);
    
    setReferenceNumber(newReferenceNumber);
    
    // Použít pouze povolené typy reprezentace
    const types: RepresentationType[] = representationTypes.filter((t: string) => 
      ['objects', 'dice', 'number', 'math'].includes(t)
    ) as RepresentationType[];
    
    // Fallback na všechny typy, pokud není vybrán žádný
    const availableTypes = types.length > 0 ? types : ['objects', 'dice', 'number', 'math'] as RepresentationType[];
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    // Vygenerovat náhodné číslo z nastaveného rozsahu
    const randomValue = Math.floor(Math.random() * (numberRange[1] - numberRange[0] + 1)) + numberRange[0];
    
    // Určení správné krabice (porovnání s referenčním číslem)
    let targetBox: ComparisonType;
    if (randomValue > newReferenceNumber) {
      targetBox = 'greater';
    } else if (randomValue === newReferenceNumber) {
      targetBox = 'equal';
    } else {
      targetBox = 'less';
    }

    // Příprava dat podle typu
    const cardData: {
      value: number;
      type: RepresentationType;
      targetBox: ComparisonType;
      emoji?: string;
      mathExpression?: { a: number; b: number };
    } = {
      value: randomValue,
      type: randomType,
      targetBox: targetBox,
    };

    // Vygenerovat emoji pro 'objects' typ (jen jednou!)
    if (randomType === 'objects') {
      cardData.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    }

    // Vygenerovat matematický příklad pro 'math' typ (jen jednou!)
    if (randomType === 'math') {
      const a = Math.floor(Math.random() * randomValue) + 1;
      const b = randomValue - a;
      cardData.mathExpression = { a, b };
    }

    setCurrentCard(cardData);
    setCardPosition('center');
    setIsSliding(false);
    setCurrentRound(prev => prev + 1);
  };

  // Inicializace hry
  useEffect(() => {
    generateNewCard();
  }, []);

  // Kliknutí na krabici
  const handleBoxClick = (boxType: ComparisonType) => {
    if (!currentCard || isSliding) return;

    // Přesun kartičky nad krabici
    setCardPosition(boxType);
    
    // Po přesunu začít animaci zasunutí
    setTimeout(() => {
      setIsSliding(true);
      
      // Po zasunutí zkontrolovat správnost
      setTimeout(() => {
        const isCorrect = currentCard.targetBox === boxType;
        
        if (isCorrect) {
          setScore(prev => prev + 1);
        } else {
          setLives(prev => Math.max(0, prev - 1));
        }
        
        // Zobrazit feedback
        setFeedback({ isCorrect });
        
        // Kontrola konce hry
        const newLives = isCorrect ? lives : lives - 1;
        const isGameOver = newLives <= 0 || currentRound >= TOTAL_ROUNDS;
        
        if (isGameOver) {
          setTimeout(() => {
            setFeedback(null);
            // Určit typ výsledku - úspěch pokud má stále životy
            setGameResultType(newLives > 0 ? 'success' : 'failure');
            setShowGameResult(true);
          }, 1500);
        }
      }, 800);
    }, 600);
  };

  // Po feedbacku generovat nové kolo
  const handleFeedbackComplete = () => {
    setFeedback(null);
    setCurrentCard(null);
    setTimeout(() => {
      generateNewCard();
    }, 300);
  };
  
  // Handler pro pokračování po výsledkové obrazovce
  const handleGameResultContinue = () => {
    setShowGameResult(false);
    // Reset hry
    setLives(3);
    setScore(0);
    setCurrentRound(0);
    setReferenceNumber(Math.floor((numberRange[0] + numberRange[1]) / 2));
    setFeedback(null);
    setCurrentCard(null);
    setTimeout(() => {
      generateNewCard();
    }, 300);
  };

  // Progress (ukazuje pokrok v rámci 5 tahů)
  const progress = (currentRound / TOTAL_ROUNDS) * 100;

  // Refs pro měření pozic krabic
  const lessBoxRef = useRef<HTMLDivElement>(null);
  const equalBoxRef = useRef<HTMLDivElement>(null);
  const greaterBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamická detekce velikosti obrazovky
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Výpočet pozice kartičky relativně ke kontejneru
  const getCardTargetPosition = () => {
    if (!containerRef.current) return { x: 0, y: 0 };

    let targetRef: React.RefObject<HTMLDivElement> | null = null;
    if (cardPosition === 'less') targetRef = lessBoxRef;
    else if (cardPosition === 'equal') targetRef = equalBoxRef;
    else if (cardPosition === 'greater') targetRef = greaterBoxRef;

    if (!targetRef?.current) return { x: 0, y: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetRef.current.getBoundingClientRect();

    // Pozice středu cílové krabice relativně ke kontejneru
    const x = targetRect.left + targetRect.width / 2 - (containerRect.left + containerRect.width / 2);
    const y = targetRect.top - containerRect.top;

    return { x, y };
  };

  // Responsive velikosti podle aktuální velikosti obrazovky
  // Desktop: větší velikosti s optimálním využitím prostoru
  const boxSize = isMobile ? 110 : 280;
  const cardSize = isMobile ? 115 : 230;
  const cardTopOffset = isMobile ? -144 : -280;
  const slideDownDistance = isMobile ? 156 : 330;

  return (
    <div 
      className="w-full flex flex-col overflow-hidden"
      style={{ 
        backgroundColor: backgroundColor,
        minHeight: '100vh',
        minHeight: '100svh', // Safari fix
      }}
    >
      {/* Hlavní herní oblast */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-4 md:gap-8 p-2 sm:p-4 md:p-8 overflow-hidden min-h-0" style={{ paddingTop: isMobile ? '100px' : '140px' }}>
        {/* Kontejner pro kartičku a krabice */}
        <div ref={containerRef} className="relative flex flex-col items-center gap-2 sm:gap-4 md:gap-10 w-full max-w-7xl">
          {/* Plovoucí kartička */}
          <AnimatePresence>
            {currentCard && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  top: cardTopOffset,
                  left: '50%',
                  zIndex: isSliding ? 5 : 50,
                }}
                initial={{ x: '-50%', y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: cardPosition === 'center' ? '-50%' : `calc(-50% + ${getCardTargetPosition().x}px)`,
                  y: isSliding ? slideDownDistance : 0,
                  scale: 1,
                  opacity: isSliding ? 0 : 1,
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <NumberCard
                  type={currentCard.type}
                  value={currentCard.value}
                  size={cardSize}
                  emoji={currentCard.emoji}
                  mathExpression={currentCard.mathExpression}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tři krabice - zleva: menší než, rovná se, větší než */}
          <div className="flex items-end justify-center gap-2 sm:gap-6 md:gap-10 lg:gap-16 w-full px-2">
            <div ref={lessBoxRef} className="flex-shrink-0">
              <Box
                type="less"
                referenceNumber={referenceNumber}
                size={boxSize}
                onClick={() => handleBoxClick('less')}
                isHighlighted={cardPosition === 'less'}
              />
            </div>
            
            <div ref={equalBoxRef} className="flex-shrink-0">
              <Box
                type="equal"
                referenceNumber={referenceNumber}
                size={boxSize}
                onClick={() => handleBoxClick('equal')}
                isHighlighted={cardPosition === 'equal'}
              />
            </div>
            
            <div ref={greaterBoxRef} className="flex-shrink-0">
              <Box
                type="greater"
                referenceNumber={referenceNumber}
                size={boxSize}
                onClick={() => handleBoxClick('greater')}
                isHighlighted={cardPosition === 'greater'}
              />
            </div>
          </div>
        </div>

        {/* Skóre a dolní lišta - centrované */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 mt-1 sm:mt-2 md:mt-4">
          {/* Skóre */}


          {/* Lišta s progressem a životy - centrovaná pod skóre */}
          <div 
            className="px-4 py-2 sm:px-5 sm:py-2.5 flex items-center gap-3 sm:gap-4 rounded-full"
            style={{ 
              backgroundColor: '#FAFAFA',
              border: '1px solid #E8E8E8',
            }}
          >
            {/* Progress bar s textem */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className="rounded-full overflow-hidden"
                style={{ 
                  backgroundColor: '#E8E8E8',
                  height: isMobile ? '8px' : '12px',
                  width: isMobile ? '120px' : '190px',
                }}
              >
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: '#93C5FD',
                  }}
                />
              </div>
              <div 
                style={{ 
                  color: '#6B7280',
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: '500',
                  minWidth: isMobile ? '70px' : '95px',
                  textAlign: 'right',
                }}
              >
                {currentRound}/{TOTAL_ROUNDS}
              </div>
            </div>

            {/* Životy - menší a světlejší */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {[1, 2, 3].map((i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  style={{
                    width: isMobile ? '18px' : '24px',
                    height: isMobile ? '18px' : '24px',
                  }}
                  fill={i <= lives ? '#F87171' : '#E5E7EB'}
                  className="flex-shrink-0"
                >
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    style={{ 
                      filter: 'none',
                    }}
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <FeedbackOverlay
            isCorrect={feedback.isCorrect}
            onComplete={handleFeedbackComplete}
          />
        )}
      </AnimatePresence>
      
      {/* Výsledková obrazovka na konci hry */}
      {showGameResult && (
        <GameResultScreen
          isSuccess={gameResultType === 'success'}
          onContinue={handleGameResultContinue}
          autoHideDuration={undefined}
          successText={gameResultType === 'success' ? 
            ['Skvělá práce! 🎯', 'Výborně! ⭐', 'Perfektní! 🏆', 'Máš to! 🌟'][Math.floor(Math.random() * 4)] :
            undefined
          }
          failureText={gameResultType === 'failure' ? 
            ['Zkus to znovu! 🤔', 'Další pokus! 💪', 'Neboj se, zvládneš to! 🌟'][Math.floor(Math.random() * 3)] :
            undefined
          }
          showContinueButton={true}
          displayType="gameComplete"
        />
      )}
    </div>
  );
}
