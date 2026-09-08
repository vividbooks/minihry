import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X } from 'lucide-react';


// Interfaces podle dokumentace
interface MathCard {
  id: string;
  problem: string;
  correctAnswer: number;
  displayedAnswer: number;
  isCorrect: boolean;
  colorIndex: number;
}

interface GameStats {
  correct: number;
  incorrect: number;
  total: number;
  timeLeft: number;
}

type GameState = 'countdown' | 'playing' | 'results' | 'cardTimeout';

interface MathTinderProps {
  settings?: Record<string, any>;
}

// Konstanty podle dokumentace - některé přepíše settings
const DEFAULT_TOTAL_CARDS = 15;
const DEFAULT_CARD_TIME_LIMIT = 0; // bez časového limitu
const ANIMATION_DURATION = 400; // ms pro swipe animaci
const FEEDBACK_DURATION = 200; // ms pro barevný feedback
const TIMEOUT_DISPLAY = 1500; // ms pro "Čas vypršel"
const DEFAULT_AUTO_RESTART = 5; // sekund do auto-restartu

// Barevná paleta pro kartičky - 7 specifických barev podle dokumentace
const CARD_COLORS = [
  { bg: '#4CAF50', text: '#ffffff', name: 'zelená' },
  { bg: '#F2D602', text: '#000000', name: 'žlutá' },
  { bg: '#7E57C2', text: '#ffffff', name: 'fialová' },
  { bg: '#FF4D6D', text: '#ffffff', name: 'červená/růžová' },
  { bg: '#4EA3FF', text: '#ffffff', name: 'modrá' },
  { bg: '#B0B0B0', text: '#000000', name: 'šedá' },
  { bg: '#F7A800', text: '#ffffff', name: 'oranžová' }
];

// Robust unique ID generator
const generateUniqueId = (() => {
  let counter = 0;
  return () => {
    counter++;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
  };
})();

// Generování matematických příkladů podle typu operace
const generateMathProblem = (operationType: string = 'addition_to_10'): MathCard => {
  let num1: number, num2: number, correctAnswer: number, problem: string;
  
  switch (operationType) {
    case 'addition_to_10':
      // 1) Sčítání do 10
      num1 = Math.floor(Math.random() * 9) + 1; // 1-9
      num2 = Math.floor(Math.random() * (10 - num1)) + 1; // 1 až (10-num1)
      correctAnswer = num1 + num2; // vždy ≤ 10
      problem = `${num1} + ${num2}`;
      break;
      
    case 'addition_subtraction_to_10':
      // 2) Sčítání a odčítání do 10
      if (Math.random() < 0.5) {
        // Sčítání
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * (10 - num1)) + 1;
        correctAnswer = num1 + num2;
        problem = `${num1} + ${num2}`;
      } else {
        // Odčítání
        correctAnswer = Math.floor(Math.random() * 10) + 1; // 1-10
        num2 = Math.floor(Math.random() * correctAnswer) + 1; // 1 až correctAnswer
        num1 = correctAnswer + num2;
        problem = `${num1} - ${num2}`;
      }
      break;
      
    case 'addition_over_10':
      // 3) Sčítání s předchodem přes 10
      num1 = Math.floor(Math.random() * 9) + 6; // 6-14
      num2 = Math.floor(Math.random() * 9) + 6; // 6-14
      correctAnswer = num1 + num2; // 12-28
      problem = `${num1} + ${num2}`;
      break;
      
    case 'addition_subtraction_over_10':
      // 4) Sčítání a odčítání s předchodem přes 10
      if (Math.random() < 0.5) {
        // Sčítání přes 10
        num1 = Math.floor(Math.random() * 9) + 6; // 6-14
        num2 = Math.floor(Math.random() * 9) + 6; // 6-14
        correctAnswer = num1 + num2;
        problem = `${num1} + ${num2}`;
      } else {
        // Odčítání přes 10
        num1 = Math.floor(Math.random() * 10) + 15; // 15-24
        num2 = Math.floor(Math.random() * 8) + 6; // 6-13
        correctAnswer = num1 - num2;
        problem = `${num1} - ${num2}`;
      }
      break;
      
    case 'comparison_to_10':
      // 5) Větší–menší do 10
      num1 = Math.floor(Math.random() * 10) + 1; // 1-10
      num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      // Ujisti se, že se čísla liší
      while (num1 === num2) {
        num2 = Math.floor(Math.random() * 10) + 1;
      }
      correctAnswer = num1 > num2 ? 1 : 0; // 1 = větší, 0 = menší
      problem = `${num1} > ${num2}`;
      break;
      
    case 'comparison_over_10':
      // 6) Větší menší přes 10
      num1 = Math.floor(Math.random() * 20) + 5; // 5-24
      num2 = Math.floor(Math.random() * 20) + 5; // 5-24
      while (num1 === num2) {
        num2 = Math.floor(Math.random() * 20) + 5;
      }
      correctAnswer = num1 > num2 ? 1 : 0;
      problem = `${num1} > ${num2}`;
      break;
      
    case 'small_multiplication':
      // 7) Malá násobilka (1-5)
      num1 = Math.floor(Math.random() * 5) + 1; // 1-5
      num2 = Math.floor(Math.random() * 5) + 1; // 1-5
      correctAnswer = num1 * num2;
      problem = `${num1} × ${num2}`;
      break;
      
    case 'large_multiplication':
      // 8) Velká násobilka (1-10)
      num1 = Math.floor(Math.random() * 10) + 1; // 1-10
      num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      correctAnswer = num1 * num2;
      problem = `${num1} × ${num2}`;
      break;
      
    default:
      // Fallback na sčítání do 10
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * (10 - num1)) + 1;
      correctAnswer = num1 + num2;
      problem = `${num1} + ${num2}`;
  }
  
  // KROK 2: Rozhodnutí o správnosti (50:50 pravděpodobnost)
  const isCorrect = Math.random() < 0.5;
  let displayedAnswer = correctAnswer;
  
  if (!isCorrect) {
    // KROK 3: Generuj špatný výsledek podle typu operace
    let offset: number;
    
    if (operationType.includes('comparison')) {
      // Pro porovnání obrátit výsledek
      displayedAnswer = correctAnswer === 1 ? 0 : 1;
    } else {
      // Pro ostatní operace použít offset
      if (operationType.includes('multiplication')) {
        offset = Math.floor(Math.random() * 5) + 1; // ±1 až ±5 pro násobilku
      } else {
        offset = Math.floor(Math.random() * 3) + 1; // ±1 až ±3 pro sčítání/odčítání
      }
      
      const direction = Math.random() < 0.5 ? -1 : 1;
      displayedAnswer = correctAnswer + (offset * direction);
      
      // KROK 4: Validace hranic
      if (displayedAnswer <= 0) {
        displayedAnswer = correctAnswer + Math.abs(offset);
      }
      
      // Horní hranice podle typu operace
      const maxValue = operationType.includes('multiplication') ? 100 : 
                     operationType.includes('over_10') ? 50 : 20;
      
      if (displayedAnswer > maxValue) {
        displayedAnswer = correctAnswer - Math.abs(offset);
      }
    }
  }
  
  // Pro porovnání zobrazovat správně/špatně místo čísel
  if (operationType.includes('comparison')) {
    const actualResult = num1 > num2;
    const displayResult = displayedAnswer === 1;
    problem = `${num1} > ${num2}`;
    
    return {
      id: generateUniqueId(),
      problem,
      correctAnswer: actualResult ? 1 : 0,
      displayedAnswer: displayResult ? 1 : 0,
      isCorrect: actualResult === displayResult,
      colorIndex: Math.floor(Math.random() * CARD_COLORS.length)
    };
  }
  
  return {
    id: generateUniqueId(),
    problem,
    correctAnswer,
    displayedAnswer,
    isCorrect,
    colorIndex: Math.floor(Math.random() * CARD_COLORS.length)
  };
};

export function MathTinder({ settings }: MathTinderProps) {
  // Extract settings with defaults
  const operationType = settings?.operationType || 'addition_to_10';
  const totalCards = settings?.totalCards || DEFAULT_TOTAL_CARDS;
  const cardTimeLimit = settings?.cardTimeLimit !== undefined ? settings.cardTimeLimit : DEFAULT_CARD_TIME_LIMIT;
  const enableSwipeGestures = settings?.enableSwipeGestures !== false; // default true
  const enableKeyboardControls = settings?.enableKeyboardControls !== false; // default true
  const autoRestartDelay = settings?.autoRestartDelay !== undefined ? settings.autoRestartDelay : DEFAULT_AUTO_RESTART;

  // Debug log
  console.log('MathTinder cardTimeLimit:', cardTimeLimit, 'settings:', settings?.cardTimeLimit, 'DEFAULT:', DEFAULT_CARD_TIME_LIMIT);

  // Stavy podle dokumentace
  const [gameState, setGameState] = useState<GameState>('playing');
  const [currentCard, setCurrentCard] = useState<MathCard | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    total: 0,
    timeLeft: cardTimeLimit > 0 ? cardTimeLimit : 0
  });
  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean }>({
    show: false,
    isCorrect: false
  });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [autoRestartTimer, setAutoRestartTimer] = useState(autoRestartDelay);

  // Refs pro časovače podle dokumentace
  const cardTimerRef = useRef<NodeJS.Timeout>();
  const autoRestartTimerRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();

  // Generování nové kartičky
  const generateNewCard = useCallback(() => {
    if (gameStats.total >= totalCards) {
      setGameState('results');
      return;
    }

    const newCard = generateMathProblem(operationType);
    setCurrentCard(newCard);
    setGameStats(prev => ({ ...prev, timeLeft: cardTimeLimit > 0 ? cardTimeLimit : 0 }));
    setSwipeDirection(null);

    // Spustí timer na kartičku (pouze pokud je nastaven časový limit)
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    if (cardTimeLimit > 0) {
      cardTimerRef.current = setTimeout(() => {
        handleCardTimeout();
      }, cardTimeLimit * 1000);
    }
  }, [gameStats.total, totalCards, cardTimeLimit, operationType]);

  // Zpracování timeout kartičky
  const handleCardTimeout = useCallback(() => {
    setGameState('cardTimeout');
    setGameStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      total: prev.total + 1,
      timeLeft: 0
    }));

    setTimeout(() => {
      if (gameStats.total + 1 >= totalCards) {
        setGameState('results');
      } else {
        setGameState('playing');
        generateNewCard();
      }
    }, TIMEOUT_DISPLAY);
  }, [gameStats.total, totalCards, generateNewCard]);

  // Zpracování uživatelské akce (like/dislike)
  const handleCardAction = useCallback((action: 'like' | 'dislike') => {
    if (!currentCard || gameState !== 'playing') return;

    // Vyčisti timer
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);

    // Vyhodnoť správnost
    const userThinkCorrect = action === 'like';
    const wasCorrect = userThinkCorrect === currentCard.isCorrect;

    // Aktualizuj statistiky
    setGameStats(prev => ({
      ...prev,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
      total: prev.total + 1,
      timeLeft: cardTimeLimit > 0 ? cardTimeLimit : 0
    }));

    // Zobraz feedback
    setFeedback({ show: true, isCorrect: wasCorrect });
    setSwipeDirection(action === 'like' ? 'right' : 'left');

    // Skryj feedback a přejdi na další kartičku
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false });
      
      if (gameStats.total + 1 >= totalCards) {
        setGameState('results');
      } else {
        generateNewCard();
      }
    }, ANIMATION_DURATION);
  }, [currentCard, gameState, gameStats.total, totalCards, generateNewCard]);

  // Timer pro countdown kartičky (pouze pokud je nastaven časový limit)
  useEffect(() => {
    if (gameState !== 'playing' || !currentCard || cardTimeLimit === 0) return;

    const timer = setInterval(() => {
      setGameStats(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          handleCardTimeout();
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentCard, handleCardTimeout, cardTimeLimit]);

  // Auto-restart timer pro results screen
  useEffect(() => {
    if (gameState !== 'results' || autoRestartDelay === 0) return;

    setAutoRestartTimer(autoRestartDelay);
    const timer = setInterval(() => {
      setAutoRestartTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          resetGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, autoRestartDelay]);

  // Klávesové zkratky
  useEffect(() => {
    if (!enableKeyboardControls) return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (event.key === 'ArrowLeft' || event.key === 'n') {
          handleCardAction('dislike');
        } else if (event.key === 'ArrowRight' || event.key === 'a') {
          handleCardAction('like');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleCardAction, enableKeyboardControls]);

  // Reset hry
  const resetGame = useCallback(() => {
    // Vyčisti všechny timery
    [cardTimerRef, autoRestartTimerRef, gameTimerRef].forEach(timer => {
      if (timer.current) clearTimeout(timer.current);
    });
    
    setGameStats({
      correct: 0,
      incorrect: 0,
      total: 0,
      timeLeft: cardTimeLimit
    });
    setCurrentCard(null);
    setFeedback({ show: false, isCorrect: false });
    setSwipeDirection(null);
    setGameState('playing');
    generateNewCard();
  }, [cardTimeLimit]);

  // Spuštění hry ihned
  useEffect(() => {
    if (gameState === 'playing' && !currentCard) {
      generateNewCard();
    }
  }, [gameState, currentCard, generateNewCard]);

  // Cleanup při unmount
  useEffect(() => {
    return () => {
      [cardTimerRef, autoRestartTimerRef, gameTimerRef].forEach(timer => {
        if (timer.current) clearTimeout(timer.current);
      });
    };
  }, []);

  // Funkce pro získání názvu typu operace
  const getOperationTypeLabel = (type: string): string => {
    switch (type) {
      case 'addition_to_10': return 'Sčítání do 10';
      case 'addition_subtraction_to_10': return 'Sčítání a odčítání do 10';
      case 'addition_over_10': return 'Sčítání s předchodem přes 10';
      case 'addition_subtraction_over_10': return 'Sčítání a odčítání s předchodem přes 10';
      case 'comparison_to_10': return 'Větší–menší do 10';
      case 'comparison_over_10': return 'Větší menší přes 10';
      case 'small_multiplication': return 'Malá násobilka';
      case 'large_multiplication': return 'Velká násobilka';
      default: return 'Matematické příklady';
    }
  };

  // Výpočet hvězdičkového hodnocení
  const getStarRating = (): { stars: number; text: string; color: string } => {
    const successRate = gameStats.total > 0 ? (gameStats.correct / gameStats.total) * 100 : 0;
    
    if (successRate >= 80) return { stars: 3, text: "Výborně!", color: "#fbbf24" };
    if (successRate >= 60) return { stars: 2, text: "Dobře!", color: "#3b82f6" };
    if (successRate >= 40) return { stars: 1, text: "Slušně", color: "#22c55e" };
    return { stars: 0, text: "Potřebuje procvičit", color: "#ef4444" };
  };

  // Render komponenty
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Responzivní layout */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto min-h-screen">
        
        {/* Herní oblast s kartičkou */}
        <div className="flex-1 p-4 lg:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            
            {/* Kartička */}
            <AnimatePresence mode="wait">
              {gameState === 'playing' && currentCard && (
                <motion.div
                  key={currentCard.id}
                  className="relative w-80 sm:w-96 rounded-3xl shadow-2xl overflow-hidden"
                  style={{ 
                    aspectRatio: '9/16',
                    backgroundColor: CARD_COLORS[currentCard.colorIndex].bg,
                    color: CARD_COLORS[currentCard.colorIndex].text
                  }}
                  initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    rotateY: 0,
                    x: swipeDirection === 'left' ? -400 : swipeDirection === 'right' ? 400 : 0,
                    rotate: swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0
                  }}
                  exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  drag={enableSwipeGestures ? "x" : false}
                  dragConstraints={{ left: -100, right: 100 }}
                  onDragEnd={enableSwipeGestures ? (event, info) => {
                    const swipeThreshold = 100;
                    if (info.offset.x > swipeThreshold) {
                      handleCardAction('like');
                    } else if (info.offset.x < -swipeThreshold) {
                      handleCardAction('dislike');
                    }
                  } : undefined}
                >
                  {/* Obsah kartičky */}
                  <div className="relative p-8 h-full">
                    
                    {/* Progress bar časovač - lehce pod horním okrajem (pouze pokud je nastaven časový limit) */}
                    {cardTimeLimit > 0 && (
                      <div className="absolute top-4 left-4 right-4 h-2 bg-black bg-opacity-20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={{ width: '100%' }}
                          animate={{ width: `${(gameStats.timeLeft / cardTimeLimit) * 100}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>
                    )}
                    
                    {/* Matematický příklad na absolutním středu */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl sm:text-5xl font-bold text-center">
                        {operationType.includes('comparison') ? (
                          <div>
                            <div className="mb-4">{currentCard.problem}</div>
                            <div className="text-3xl sm:text-4xl">
                              {currentCard.displayedAnswer === 1 ? 'PRAVDA' : 'NEPRAVDA'}
                            </div>
                          </div>
                        ) : (
                          `${currentCard.problem} = ${currentCard.displayedAnswer}`
                        )}
                      </div>
                    </div>

                    {/* Akční tlačítka na spodku */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-8">
                        <motion.button
                          onClick={() => handleCardAction('dislike')}
                          className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={40} />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleCardAction('like')}
                          className="w-20 h-20 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart size={40} fill="currentColor" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeout zpráva */}
            {gameState === 'cardTimeout' && (
              <motion.div
                className="w-80 sm:w-96 rounded-3xl shadow-2xl bg-red-500 text-white p-8 flex items-center justify-center text-center"
                style={{ aspectRatio: '9/16' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div>
                  <div className="text-4xl mb-4">⏰</div>
                  <div className="text-2xl font-bold">Čas vypršel!</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Kontrolní panel */}
        <div className="w-full lg:w-80 p-4 lg:p-6 flex items-center justify-center min-h-screen lg:min-h-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            
            {/* Nadpis s typem operace */}
            <h1 className="text-red-600 text-xl font-medium mb-2 text-center lg:text-left">
              {operationType.includes('comparison') ? 'Je tvrzení pravdivé?' : 'Je to správně?'}
            </h1>
            <div className="text-sm text-gray-600 mb-6 text-center lg:text-left">
              {getOperationTypeLabel(operationType)}
            </div>

            {/* Časovač (pouze pokud je nastaven časový limit) */}
            {gameState === 'playing' && cardTimeLimit > 0 && (
              <div className="mb-6">
                <div className="text-gray-800 font-medium mb-3 text-center lg:text-left">
                  Zbývající čas:
                </div>
                <div className="flex justify-center lg:justify-start">
                  <div className="text-4xl font-bold text-yellow-600">
                    {gameStats.timeLeft}s
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-red-600 font-medium">Příklady:</div>
                <div className="text-black font-medium">{gameStats.total} / {totalCards}</div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                <div 
                  className="h-4 bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${(gameStats.total / totalCards) * 100}%` }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                {totalCards - gameStats.total} zbývá
              </div>
            </div>

            {/* Aktuální skóre */}
            <div className="mb-6">
              <div className="text-gray-800 font-medium mb-4 text-center lg:text-left">
                Aktuální skóre:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                  <div className="text-green-600 font-medium text-sm mb-1">
                    <Heart size={16} className="inline mr-1" fill="currentColor" />
                    Správně
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {gameStats.correct}
                  </div>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                  <div className="text-red-600 font-medium text-sm mb-1">
                    <X size={16} className="inline mr-1" />
                    Špatně
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {gameStats.incorrect}
                  </div>
                </div>
              </div>
            </div>

            {/* Nová hra */}
            <motion.button
              onClick={resetGame}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium shadow-md"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              🔄 Nová hra
            </motion.button>
          </div>
        </div>
      </div>

      {/* Barevný feedback overlay */}
      <AnimatePresence>
        {feedback.show && (
          <motion.div
            className={`fixed inset-0 z-10 ${
              feedback.isCorrect ? 'bg-green-500' : 'bg-red-500'
            } bg-opacity-30`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FEEDBACK_DURATION / 1000 }}
          />
        )}
      </AnimatePresence>



      {/* Results modal */}
      <AnimatePresence>
        {gameState === 'results' && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              {/* Hodnocení hvězdičkami */}
              <div className="flex gap-1 justify-center mb-4">
                {Array.from({ length: 3 }).map((_, index) => {
                  const rating = getStarRating();
                  return (
                    <span 
                      key={index}
                      className={`text-3xl ${
                        index < rating.stars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: getStarRating().color }}>
                {getStarRating().text}
              </h2>
              
              {/* Skóre */}
              <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6">
                <div className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">
                  {gameStats.correct}/{gameStats.total}
                </div>
                <div className="text-lg md:text-xl text-gray-600 mb-2">
                  {Math.round((gameStats.correct / gameStats.total) * 100)}% správně
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                  <motion.div 
                    className="h-3 md:h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ backgroundColor: getStarRating().color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(gameStats.correct / gameStats.total) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Auto-restart info */}
              {autoRestartDelay > 0 && (
                <div className="mb-4 text-sm text-gray-500">
                  Automaticky pokračuje za {autoRestartTimer} sekund...
                </div>
              )}
              
              {/* Tlačítko pokračovat */}
              <motion.button
                onClick={resetGame}
                className="w-full py-3 md:py-4 rounded-2xl text-lg md:text-xl font-medium text-white transition-colors shadow-lg"
                style={{ backgroundColor: getStarRating().color }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Hrát znovu
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}