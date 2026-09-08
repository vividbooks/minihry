import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { GameFeedback } from './GameFeedback';
import { GameResultScreen } from './GameResultScreen';

interface MathExpression {
  id: string;
  expression: string;
  value: number;
}

interface DroppedExpression extends MathExpression {
  position: number;
}

interface MathSnakeGameProps {
  settings?: {
    backgroundColor?: string;
    numberRange?: [number, number];
    difficulty?: number; // 1-3 (mapuje se na internal level 2-4)
  };
}

const EXPRESSION_TYPES = {
  addition: (target: number) => {
    const a = Math.floor(Math.random() * (target - 1)) + 1;
    const b = target - a;
    return { expression: `${a} + ${b}`, value: target };
  },
  subtraction: (target: number) => {
    const a = target + Math.floor(Math.random() * 10) + 1;
    const b = a - target;
    return { expression: `${a} - ${b}`, value: target };
  }
};

const generateExpressions = (
  targetNumber: number, 
  count: number, 
  level: number,
  usedExpressionsHistory: Set<string>
): { expressions: MathExpression[]; noMoreDecompositions: boolean } => {
  const expressions: MathExpression[] = [];
  const usedExpressions = new Set<string>(usedExpressionsHistory);
  const types = Object.keys(EXPRESSION_TYPES) as (keyof typeof EXPRESSION_TYPES)[];
  
  const availableTypes = level <= 4 ? ['addition'] : types;
  const correctCount = Math.min(2, Math.max(1, Math.floor(Math.random() * 2) + 1));
  
  let attempts = 0;
  while (expressions.filter(e => e.value === targetNumber).length < correctCount && attempts < 100) {
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)] as keyof typeof EXPRESSION_TYPES;
    const expr = EXPRESSION_TYPES[type](targetNumber);
    
    if (!usedExpressions.has(expr.expression)) {
      usedExpressions.add(expr.expression);
      expressions.push({
        id: `correct-${expressions.length}-${Date.now()}-${Math.random()}`,
        expression: expr.expression,
        value: expr.value
      });
    }
    attempts++;
  }
  
  // Kontrola, zda se nepodařilo najít žádné nové správné rozklady
  const foundCorrect = expressions.filter(e => e.value === targetNumber).length;
  const noMoreDecompositions = foundCorrect === 0 && attempts >= 100;
  
  const incorrectCount = count - expressions.length;
  attempts = 0;
  while (expressions.length < count && attempts < 100) {
    const wrongTarget = targetNumber + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)] as keyof typeof EXPRESSION_TYPES;
    const expr = EXPRESSION_TYPES[type](Math.max(1, wrongTarget));
    
    if (!usedExpressions.has(expr.expression)) {
      usedExpressions.add(expr.expression);
      expressions.push({
        id: `incorrect-${expressions.length}-${Date.now()}-${Math.random()}`,
        expression: expr.expression,
        value: expr.value
      });
    }
    attempts++;
  }
  
  return { 
    expressions: expressions.sort(() => Math.random() - 0.5),
    noMoreDecompositions
  };
};

// Paleta barev pro kartičky - veselé barvy
const CARD_COLORS = [
  { bg: '#FFE8ED', border: '#FF6B9D', text: '#C7375F' }, // Růžová
  { bg: '#E7F9EE', border: '#4CAF50', text: '#2E7D32' }, // Zelená
  { bg: '#FAF3D4', border: '#FFC107', text: '#F57C00' }, // Žlutá
  { bg: '#D0DBFF', border: '#5C7CFA', text: '#364FC7' }, // Modrá
  { bg: '#FFE8D9', border: '#FF9066', text: '#D84315' }, // Oranžová
  { bg: '#E8CDD6', border: '#E91E63', text: '#AD1457' }, // Malinová
];

const ExpressionCard: React.FC<{ 
  expression: MathExpression; 
  isUsed: boolean;
  onClick?: () => void;
  colorIndex: number;
}> = ({ expression, isUsed, onClick, colorIndex }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'expression',
    item: expression,
    canDrag: !isUsed,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragTimeoutRef = useRef<NodeJS.Timeout>();
  const [clickDisabled, setClickDisabled] = useState(false);

  useEffect(() => {
    if (isDragging) {
      setClickDisabled(true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      dragTimeoutRef.current = setTimeout(() => {
        setClickDisabled(false);
      }, 200);
    }
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging && !clickDisabled && !isUsed && onClick) {
      onClick();
    }
  };

  const color = CARD_COLORS[colorIndex % CARD_COLORS.length];
  const isMobile = window.innerWidth < 640;

  return (
    <div
      ref={!isUsed ? drag : null}
      onClick={handleClick}
      className={`
        px-8 sm:px-15 py-6 sm:py-11 rounded-lg sm:rounded-xl border-2 transition-all duration-200 cursor-pointer
        flex items-center justify-center min-w-[120px] sm:min-w-[180px] min-h-[70px] sm:min-h-[112px]
        ${isDragging ? 'opacity-50 rotate-2' : ''}
        select-none absolute
      `}
      style={{
        backgroundColor: isUsed ? '#E5E7EB' : color.bg,
        borderColor: isUsed ? '#D1D5DB' : color.border,
        color: isUsed ? '#9CA3AF' : color.text,
        cursor: isUsed ? 'not-allowed' : 'pointer',
        boxShadow: isUsed ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div className="font-medium text-3xl sm:text-5xl md:text-6xl whitespace-nowrap">{expression.expression}</div>
    </div>
  );
};

// Vizuální segment hada - box s rovnítkem na konci, responsive!
const SnakeSegment: React.FC<{ expression: DroppedExpression; colorIndex: number }> = ({ expression, colorIndex }) => {
  const color = CARD_COLORS[colorIndex % CARD_COLORS.length];
  const isMobile = window.innerWidth < 640;
  
  return (
    <div 
      className="px-2 sm:px-4 py-2 sm:py-4 rounded-lg sm:rounded-xl font-bold whitespace-nowrap text-2xl sm:text-4xl md:text-5xl flex items-center justify-center flex-shrink-0"
      style={{
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: isMobile ? '2px' : '3px',
        borderStyle: 'solid',
        color: color.text,
        minHeight: isMobile ? '56px' : '88px'
      }}
    >
      {expression.expression} =
    </div>
  );
};

// Drop slot pro aktuální pozici hada - responsive!
const SnakeSlot: React.FC<{
  droppedExpression?: DroppedExpression;
  onDrop: (expression: MathExpression) => void;
  onRemove: () => void;
  targetNumber: number;
}> = ({ droppedExpression, onDrop, onRemove, targetNumber }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'expression',
    canDrop: () => !droppedExpression,
    drop: (item: MathExpression) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isEmpty = !droppedExpression;
  const isCorrect = droppedExpression?.value === targetNumber;
  const isMobile = window.innerWidth < 640;

  return (
    <div
      ref={drop}
      onClick={droppedExpression ? onRemove : undefined}
      className={`
        px-2 sm:px-4 py-2 sm:py-4 rounded-lg sm:rounded-xl flex items-center justify-center
        transition-all duration-300 cursor-pointer text-2xl sm:text-4xl md:text-5xl font-bold flex-shrink-0
        ${isEmpty
          ? `border-dashed border-blue-300 bg-blue-50 ${isOver && canDrop ? 'border-blue-500 bg-blue-100' : ''}`
          : isCorrect 
            ? 'border-green-400 bg-green-100 text-green-800 hover:bg-green-200'
            : 'border-red-400 bg-red-100 text-red-800 hover:bg-red-200'
        }
      `}
      style={{
        borderWidth: isEmpty ? (isMobile ? '2px' : '3px') : (isMobile ? '2px' : '3px'),
        borderStyle: isEmpty ? 'dashed' : 'solid',
        minHeight: isMobile ? '56px' : '88px',
        minWidth: isMobile ? '80px' : '120px'
      }}
    >
      {isEmpty ? (
        <div className="text-blue-400">?</div>
      ) : (
        <div className="text-center">
          {droppedExpression.expression} =
        </div>
      )}
    </div>
  );
};

export const MathSnakeGame: React.FC<MathSnakeGameProps> = ({ settings = {} }) => {
  const {
    backgroundColor = '#FAF3D4',
    numberRange = [5, 20],
    difficulty = 1,
  } = settings;

  // Mapování difficulty (1-3) na internal level (2-4)
  const level = difficulty + 1;
  
  const [targetNumber, setTargetNumber] = useState(5);
  const [expressions, setExpressions] = useState<MathExpression[]>([]);
  const [currentExpression, setCurrentExpression] = useState<DroppedExpression | null>(null);
  const [usedExpressionIds, setUsedExpressionIds] = useState<Set<string>>(new Set());
  const [snakeSegments, setSnakeSegments] = useState<DroppedExpression[]>([]);
  const [usedExpressionsHistory, setUsedExpressionsHistory] = useState<Set<string>>(new Set());
  const [showGameFeedback, setShowGameFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [allDecompositionsFound, setAllDecompositionsFound] = useState(false);
  
  const processingRef = useRef(false);

  const generateLevel = useCallback(() => {
    const [minNum, maxNum] = numberRange;
    let newTarget: number;
    let cardCount: number;
    
    if (level === 2) {
      const levelMin = Math.max(minNum, 5);
      const levelMax = Math.min(maxNum, 11);
      newTarget = Math.floor(Math.random() * (levelMax - levelMin + 1)) + levelMin;
      cardCount = 6;
    } else {
      const levelMin = Math.max(minNum, 9);
      const levelMax = Math.max(maxNum, levelMin + 5);
      newTarget = Math.floor(Math.random() * (levelMax - levelMin + 1)) + levelMin;
      cardCount = 6;
    }
    
    setTargetNumber(newTarget);
    setSnakeSegments([]);
    setCurrentExpression(null);
    setUsedExpressionIds(new Set());
    setUsedExpressionsHistory(new Set());
    setGameCompleted(false);
    setAllDecompositionsFound(false);
    
    const result = generateExpressions(newTarget, cardCount, level, new Set());
    setExpressions(result.expressions);
    
    processingRef.current = false;
  }, [level, numberRange]);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  useEffect(() => {
    if (currentExpression && !showGameFeedback && processingRef.current) {
      const timeoutId = setTimeout(() => {
        if (currentExpression.value === targetNumber) {
          setLastAnswerCorrect(true);
          setShowGameFeedback(true);
          
          // Přidat segment hada a výraz do historie
          setSnakeSegments(prev => [...prev, currentExpression]);
          setUsedExpressionsHistory(prev => new Set([...prev, currentExpression.expression]));
          
          // gameCompleted nepoužíváme pro zobrazení videa, jen pro interní logiku
          setGameCompleted(false);
        } else {
          setLastAnswerCorrect(false);
          setShowGameFeedback(true);
        }
      }, 10);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [currentExpression, targetNumber, showGameFeedback, snakeSegments.length]);

  const onFeedbackComplete = () => {
    setShowGameFeedback(false);
    
    if (lastAnswerCorrect) {
      // Po správné odpovědi - vygenerovat další rozklady
      setCurrentExpression(null);
      processingRef.current = false;
      
      // Použít delší timeout aby se segment stihla přidat do hada
      setTimeout(() => {
        const cardCount = 6;
        const result = generateExpressions(targetNumber, cardCount, level, usedExpressionsHistory);
        
        // Kontrola, zda se podařilo najít nové rozklady
        if (result.noMoreDecompositions) {
          // Všechny rozklady byly nalezeny - POČKAT a pak zobrazit úspěšnou obrazovku!
          console.log('Všechny rozklady byly nalezeny! Počet segmentů:', snakeSegments.length);
          setTimeout(() => {
            setAllDecompositionsFound(true);
          }, 500); // Extra delay pro plynulý přechod
        } else {
          // Ještě existují rozklady - pokračovat ve hře
          setExpressions(result.expressions);
          setUsedExpressionIds(new Set());
        }
      }, 300); // Zvětšený timeout
    } else {
      // Při chybné odpovědi resetovat had i historii
      setCurrentExpression(null);
      processingRef.current = false;
      setTimeout(() => {
        setSnakeSegments([]);
        setUsedExpressionIds(new Set());
        setUsedExpressionsHistory(new Set());
        const cardCount = 6;
        const result = generateExpressions(targetNumber, cardCount, level, new Set());
        setExpressions(result.expressions);
      }, 100);
    }
  };

  const handleDrop = (expression: MathExpression) => {
    if (
      usedExpressionIds.has(expression.id) || 
      currentExpression || 
      showGameFeedback || 
      processingRef.current
    ) {
      return;
    }
    
    processingRef.current = true;
    
    const newDroppedExpression: DroppedExpression = {
      ...expression,
      position: snakeSegments.length
    };
    
    setCurrentExpression(newDroppedExpression);
    setUsedExpressionIds(prev => new Set([...prev, expression.id]));
  };

  const handleRemove = () => {
    if (currentExpression && !processingRef.current) {
      setUsedExpressionIds(prev => {
        const updated = new Set(prev);
        updated.delete(currentExpression.id);
        return updated;
      });
      setCurrentExpression(null);
    }
  };

  const handleExpressionClick = (expression: MathExpression) => {
    if (
      usedExpressionIds.has(expression.id) || 
      currentExpression || 
      showGameFeedback || 
      processingRef.current
    ) {
      return;
    }
    
    handleDrop(expression);
  };

  const resetGame = () => {
    generateLevel();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor }}>
        <div className="w-full max-w-7xl">
          {/* Header s nadpisem - responsive velikost */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-blue-800 text-3xl sm:text-4xl md:text-5xl font-bold">Vytvoř hada!</h1>
          </div>

        {/* VIZUÁLNÍ HAD */}
        <div className="mb-4 sm:mb-8 bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Hlava hada - kolečko, responsive velikost! */}
            <div 
              className="text-white rounded-full shadow-lg flex items-center justify-center flex-shrink-0" 
              style={{ 
                backgroundColor: '#003CFF', 
                width: window.innerWidth < 640 ? '70px' : '106px',
                height: window.innerWidth < 640 ? '70px' : '106px'
              }}
            >
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold">{targetNumber} =</div>
            </div>
            
            {/* Had - segmenty ÚPLNĚ na sobě, žádné mezery ani rovnítka */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center">
                {/* Vykreslené segmenty hada - každý jiné barvy, bez mezer */}
                {snakeSegments.map((segment, index) => (
                  <SnakeSegment 
                    key={`snake-${index}`}
                    expression={segment} 
                    colorIndex={index}
                  />
                ))}
                
                {/* Aktuální drop slot */}
                <SnakeSlot
                  droppedExpression={currentExpression}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                  targetNumber={targetNumber}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expression Cards - Dynamic layout s barevnými kartičkami, responsive grid */}
        <div className="w-full mb-4 sm:mb-8 grid grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2 gap-0 h-[480px] sm:h-[420px]">
          {expressions.map((expression, index) => {
            const seed = targetNumber * 17 + level * 31 + snakeSegments.length * 47 + index * 23;
            const randomX = (seed * 7) % 30;
            const randomY = (seed * 11) % 25;
            const rotation = -20 + ((seed * 13) % 40);
            
            return (
              <div 
                key={expression.id}
                className="relative flex items-center justify-center rounded-lg"
              >
                <div
                  className="absolute"
                  style={{ 
                    left: `${randomX}%`,
                    top: `${randomY}%`,
                    transform: `rotate(${rotation}deg)`,
                    zIndex: 10
                  }}
                >
                  <ExpressionCard
                    expression={expression}
                    isUsed={usedExpressionIds.has(expression.id)}
                    onClick={() => handleExpressionClick(expression)}
                    colorIndex={index}
                  />
                </div>
              </div>
            );
          })}
        </div>

          {/* Reset Button - responsive velikost */}
          <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-40">
            <Button
              onClick={resetGame}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              <RefreshCw className="w-3 h-3 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>

          {/* GameFeedback systém - správně/špatně hlášky (BEZ videa) */}
          <GameFeedback
            isVisible={showGameFeedback}
            isCorrect={lastAnswerCorrect}
            onComplete={onFeedbackComplete}
            isGameComplete={false}
          />
          
          {/* GameResultScreen - zobrazí se když dojdou všechny rozklady */}
          {allDecompositionsFound && snakeSegments.length > 0 && (
            <GameResultScreen
              isSuccess={true}
              onContinue={resetGame}
              successText="SKVĚLÉ! NAŠEL JSI VŠECHNY ROZKLADY!"
              showContinueButton={true}
              displayType="gameComplete"
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
};
