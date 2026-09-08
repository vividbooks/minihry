/**
 * HRA: ČEHO JE VÍC (QuantityComparisonGame)
 * 
 * Popis: Matematická hra pro děti zaměřená na porovnávání množství objektů.
 * Hráč má dva kontejnery s různým počtem objektů a musí určit, který obsahuje více objektů.
 * 
 * Hlavní komponenty:
 * - GameState: Stav hry (kolo, skóre, životy, čas, fáze hry)
 * - RoundData: Data pro jedno kolo (levý/pravý kontejner, správná odpověď)
 * - SVG objekty: 18 různých typů objektů (tlačítka, kuličky, jablka, bonbony, atd.)
 * 
 * Funkce:
 * - Generování náhodných pozic objektů pomocí grid systému
 * - Časový limit pro každé kolo (15s default)
 * - Systém životů (3 default)
 * - Responzivní design (mobil/tablet/desktop)
 * - Animace a feedback overlay
 * - Statistiky a výsledková obrazovka
 * 
 * Nastavitelné parametry:
 * - totalRounds: počet kol (default 10)
 * - timeLimit: časový limit na kolo (default 15s)
 * - maxLives: počet životů (default 3)
 * - objectRange: rozsah počtu objektů [min, max]
 * - maxDifference: maximální rozdíl mezi kontejnery
 * - backgroundColor: barva pozadí
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCcw } from 'lucide-react';
import { CountdownOverlay } from './CountdownOverlay';
import { TimeIndicator } from './TimeIndicator';
import { GameResultScreen } from './GameResultScreen';
import { ImageWithFallback } from './figma/ImageWithFallback';

// SVG symboly z Supabase - 18 různých objektů pro hru
const SVG_SYMBOLS = [
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin math/objektyobecne/barevnesymboly_1_3_bluebutton.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_1_5_redbutton.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_2_3_bluebead.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_2_5_redbead.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_3_3_orangeapple.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_3_5_redapple.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_4_1_blackbonbon.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/barevnesymboly_4_3_purplebonbon.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_1_10_ctyrlistek.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_1_2_vlaskyorech.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_1_4_svestka.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_1_6_dyne.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_1_8_mandarinka.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_2_6_auticko.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/dalsisymboly_3_1_cernakocka.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/geometrie_2_2_redcross.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/kostky_1_4_orange.svg',
  'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objektyobecne/kostky_1_7_forest.svg'
];

// Typy objektů s názvy, SVG URL a barvami pro lepší identifikaci
const OBJECT_TYPES = [
  { name: 'modrétlačítko', svgUrl: SVG_SYMBOLS[0], color: '#3b82f6' },
  { name: 'červenétlačítko', svgUrl: SVG_SYMBOLS[1], color: '#ef4444' },
  { name: 'modrákulička', svgUrl: SVG_SYMBOLS[2], color: '#3b82f6' },
  { name: 'červenákulička', svgUrl: SVG_SYMBOLS[3], color: '#ef4444' },
  { name: 'oranžovéjablko', svgUrl: SVG_SYMBOLS[4], color: '#f97316' },
  { name: 'červenéjablko', svgUrl: SVG_SYMBOLS[5], color: '#ef4444' },
  { name: 'černébonbon', svgUrl: SVG_SYMBOLS[6], color: '#374151' },
  { name: 'fialovébonbon', svgUrl: SVG_SYMBOLS[7], color: '#8b5cf6' },
  { name: 'čtyřlístek', svgUrl: SVG_SYMBOLS[8], color: '#22c55e' },
  { name: 'vlaskýořech', svgUrl: SVG_SYMBOLS[9], color: '#92400e' },
  { name: 'švestka', svgUrl: SVG_SYMBOLS[10], color: '#7c3aed' },
  { name: 'dýně', svgUrl: SVG_SYMBOLS[11], color: '#f97316' },
  { name: 'mandarinka', svgUrl: SVG_SYMBOLS[12], color: '#ea580c' },
  { name: 'autíčko', svgUrl: SVG_SYMBOLS[13], color: '#3b82f6' },
  { name: 'černákocka', svgUrl: SVG_SYMBOLS[14], color: '#374151' },
  { name: 'červenýkříž', svgUrl: SVG_SYMBOLS[15], color: '#ef4444' },
  { name: 'oranžovákostka', svgUrl: SVG_SYMBOLS[16], color: '#f97316' },
  { name: 'zelenákostka', svgUrl: SVG_SYMBOLS[17], color: '#22c55e' }
];

// Props pro hlavní komponentu - nastavení hry
interface QuantityComparisonGameProps {
  settings?: Record<string, any>;
}

// Stav hry - všechny důležité údaje o aktuálním stavu
interface GameState {
  round: number;                // aktuální kolo
  score: number;               // aktuální skóre
  lives: number;               // zbývající životy
  timeLeft: number;            // zbývající čas v sekundách
  isGameActive: boolean;       // zda je hra aktivní
  showResult: boolean;         // zda zobrazit výsledkovou obrazovku
  gamePhase: 'countdown' | 'playing' | 'feedback' | 'ended';  // fáze hry
  showCorrectAnswer: boolean;  // zda zobrazit feedback overlay
}

// Statistiky hry pro výsledkovou obrazovku
interface GameStats {
  totalRounds: number;           // celkový počet odehraných kol
  correctAnswers: number;        // počet správných odpovědí
  incorrectAnswers: number;      // počet špatných odpovědí
  timeouts: number;              // počet timeoutů
  averageTimePerRound: number;   // průměrný čas na kolo
  finalScore: number;            // finální skóre
}

// Data pro jedno kolo - levý a pravý kontejner
interface RoundData {
  leftContainer: { count: number; type: typeof OBJECT_TYPES[0] };   // levý kontejner
  rightContainer: { count: number; type: typeof OBJECT_TYPES[0] };  // pravý kontejner
  correctAnswer: 'left' | 'right';                                  // správná odpověď
}

export function QuantityComparisonGame({ settings }: QuantityComparisonGameProps) {
  // Debug: Vypsat nastavení do konzole pro ladění
  console.log('QuantityComparisonGame settings:', settings);
  
  // Konstanty hry z nastavení nebo výchozí hodnoty
  const TOTAL_ROUNDS = settings?.totalRounds || 10;    // počet kol
  const TIME_LIMIT = settings?.timeLimit || 15;        // časový limit na kolo
  const MAX_LIVES = settings?.maxLives || 3;           // počet životů
  
  // OPRAVA: Správné čtení rozsahu z objectRange (podle gameRegistry)
  let MAX_OBJECTS, MIN_OBJECTS;
  if (settings?.objectRange && Array.isArray(settings.objectRange)) {
    [MIN_OBJECTS, MAX_OBJECTS] = settings.objectRange;
  } else {
    // Fallback na jiné možné formáty nebo výchozí hodnoty
    MAX_OBJECTS = settings?.maxObjects || 10;
    MIN_OBJECTS = settings?.minObjects || 3;
  }
  
  const MAX_DIFFERENCE = settings?.maxDifference || 3;  // maximální rozdíl mezi kontejnery
  const BACKGROUND_COLOR = settings?.backgroundColor || '#F5F1E8';  // barva pozadí
  
  // Debug: Vypsat finální hodnoty pro kontrolu
  console.log('Final game settings:', {
    TOTAL_ROUNDS,
    TIME_LIMIT, 
    MAX_LIVES,
    MAX_OBJECTS,
    MIN_OBJECTS,
    MAX_DIFFERENCE,
    objectRange: settings?.objectRange
  });
  
  // Hlavní stav hry
  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    score: 0,
    lives: MAX_LIVES,
    timeLeft: TIME_LIMIT,
    isGameActive: false,
    showResult: false,
    gamePhase: 'countdown',
    showCorrectAnswer: false
  });

  // Ostatní stavy
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);  // aktuální kolo
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);  // feedback
  const [roundKey, setRoundKey] = useState(0); // Pro přegenerování pozic
  const [objectPositions, setObjectPositions] = useState<{    // pozice objektů
    left: Array<{x: number, y: number, rotation: number}>,
    right: Array<{x: number, y: number, rotation: number}>
  }>({ left: [], right: [] });
  const [gameStats, setGameStats] = useState<GameStats>({     // statistiky
    totalRounds: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeouts: 0,
    averageTimePerRound: 0,
    finalScore: 0
  });
  const [roundStartTime, setRoundStartTime] = useState<number>(0);  // čas začátku kola



  // Generování grid-based pozic pro rovnoměrné rozmístění objektů
  // Používá optimální grid podle počtu objektů a rozměrů kontejneru
  const generateGridPositions = useCallback((count: number, containerWidth: number, containerHeight: number, objectSize: number) => {
    const positions = [];
    
    if (count === 0) return positions;
    
    // Vypočítej optimální grid podle počtu objektů
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);
    
    // Pro lepší využití prostoru, zkus různé kombinace gridu
    const possibleGrids = [
      { cols: 1, rows: count },
      { cols: 2, rows: Math.ceil(count / 2) },
      { cols: 3, rows: Math.ceil(count / 3) },
      { cols: Math.ceil(Math.sqrt(count)), rows: Math.ceil(count / Math.ceil(Math.sqrt(count))) },
      { cols: count, rows: 1 }
    ];
    
    // Vyber grid s nejlepším poměrem k rozměrům kontejneru
    let bestGrid = possibleGrids[0];
    let bestRatio = Math.abs((containerWidth / containerHeight) - (bestGrid.cols / bestGrid.rows));
    
    for (const grid of possibleGrids) {
      if (grid.cols * grid.rows >= count) {
        const ratio = Math.abs((containerWidth / containerHeight) - (grid.cols / grid.rows));
        if (ratio < bestRatio) {
          bestRatio = ratio;
          bestGrid = grid;
        }
      }
    }
    
    cols = bestGrid.cols;
    rows = bestGrid.rows;
    
    // Vypočítej velikost buněk
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    
    // Umísti objekty do grid buněk s náhodným offsetem
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // Střed buňky
      const centerX = col * cellWidth + cellWidth / 2;
      const centerY = row * cellHeight + cellHeight / 2;
      
      // Větší náhodný offset pro více náhodné rozmístění (max 40% velikosti buňky)
      const offsetRange = Math.min(cellWidth, cellHeight) * 0.4;
      const offsetX = (Math.random() - 0.5) * offsetRange;
      const offsetY = (Math.random() - 0.5) * offsetRange;
      
      // Finální pozice s kontrolou hranic a minimálním marginem pro více prostoru
      const margin = objectSize * 0.1; // 10% velikosti objektu jako minimální margin
      const x = Math.max(margin, Math.min(containerWidth - objectSize - margin, centerX + offsetX - objectSize / 2));
      const y = Math.max(margin, Math.min(containerHeight - objectSize - margin, centerY + offsetY - objectSize / 2));
      
      const rotation = Math.random() * 80 - 40; // náhodná rotace -40° až +40° pro více variability
      
      positions.push({ x, y, rotation });
    }
    
    return positions;
  }, []);

  // Generování nového kola s podobnějšími čísly
  // Vytváří dva kontejnery s různým počtem objektů podle nastavení
  const generateRound = useCallback((): RoundData => {
    // Generuj první číslo v rozsahu
    const firstCount = Math.floor(Math.random() * (MAX_OBJECTS - MIN_OBJECTS + 1)) + MIN_OBJECTS;
    
    // Generuj druhé číslo s rozdílem podle nastavení, ale nikdy stejné
    const maxDiff = MAX_DIFFERENCE;
    const minSecond = Math.max(MIN_OBJECTS, firstCount - maxDiff);
    const maxSecond = Math.min(MAX_OBJECTS, firstCount + maxDiff);
    
    let secondCount;
    do {
      secondCount = Math.floor(Math.random() * (maxSecond - minSecond + 1)) + minSecond;
    } while (Math.abs(firstCount - secondCount) > maxDiff || firstCount === secondCount);
    
    const leftCount = firstCount;
    const rightCount = secondCount;

    // Urči správnou odpověď
    let correctAnswer: 'left' | 'right';
    if (leftCount > rightCount) correctAnswer = 'left';
    else correctAnswer = 'right';

    // Vyber dva různé typy objektů pro zajímavější hratelnost
    const leftType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    let rightType;
    do {
      rightType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    } while (rightType.name === leftType.name); // Zajisti, že jsou různé

    // Generuj pozice pro objekty podle velikosti obrazovky
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 768;
    
    const containerWidth = isMobile ? 160 : isTablet ? 192 : 480; // ještě širší desktop
    const containerHeight = isMobile ? 240 : isTablet ? 224 : 460; // zvětšeno desktop o 20%  
    const objectSize = isMobile ? 84 : isTablet ? 110 : 140; // 100% větší symboly
    
    // Větší margin pro desktop, menší pro mobil
    const margin = isMobile ? 20 : 60;
    const leftPositions = generateGridPositions(leftCount, containerWidth - margin, containerHeight - margin, objectSize);
    const rightPositions = generateGridPositions(rightCount, containerWidth - margin, containerHeight - margin, objectSize);
    
    // Ulož pozice do stavu
    setObjectPositions({
      left: leftPositions,
      right: rightPositions
    });

    return {
      leftContainer: { count: leftCount, type: leftType },
      rightContainer: { count: rightCount, type: rightType },
      correctAnswer
    };
  }, [generateGridPositions, MAX_OBJECTS, MIN_OBJECTS, MAX_DIFFERENCE]);

  // Spuštění nové hry - resetuje všechny stavy
  const startNewGame = useCallback(() => {
    setGameState({
      round: 1,
      score: 0,
      lives: MAX_LIVES,
      timeLeft: TIME_LIMIT,
      isGameActive: false,
      showResult: false,
      gamePhase: 'countdown',
      showCorrectAnswer: false
    });
    setCurrentRound(null);
    setFeedback(null);
    setObjectPositions({ left: [], right: [] });
    setGameStats({
      totalRounds: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeouts: 0,
      averageTimePerRound: 0,
      finalScore: 0
    });
    setRoundStartTime(0);
  }, [MAX_LIVES, TIME_LIMIT]);

  // Zahájení hry po main countdown
  const handleCountdownComplete = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'playing', 
      isGameActive: true,
      timeLeft: TIME_LIMIT 
    }));
    setCurrentRound(generateRound());
    setRoundStartTime(Date.now());
  }, [generateRound, TIME_LIMIT]);

  // Timer pro kolo - odpočítává čas a řeší timeout
  useEffect(() => {
    if (gameState.isGameActive && gameState.gamePhase === 'playing' && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && gameState.gamePhase === 'playing') {
      // Čas vypršel
      handleAnswer('timeout');
    }
  }, [gameState.timeLeft, gameState.isGameActive, gameState.gamePhase]);

  // Zpracování odpovědi - správná/špatná/timeout
  const handleAnswer = useCallback((answer: 'left' | 'right' | 'timeout') => {
    if (!currentRound || gameState.gamePhase !== 'playing') return;

    const isCorrect = answer === currentRound.correctAnswer && answer !== 'timeout';
    const roundTime = Date.now() - roundStartTime;
    
    // Nastavíme feedback pro overlay
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    // Zobrazíme overlay správně/špatně
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'feedback',
      showCorrectAnswer: true
    }));
    
    // Aktualizace statistik
    setGameStats(prev => {
      const newTotalRounds = prev.totalRounds + 1;
      const newStats = {
        ...prev,
        totalRounds: newTotalRounds,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        incorrectAnswers: !isCorrect && answer !== 'timeout' ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
        timeouts: answer === 'timeout' ? prev.timeouts + 1 : prev.timeouts,
        averageTimePerRound: newTotalRounds > 0 ? ((prev.averageTimePerRound * prev.totalRounds) + roundTime) / newTotalRounds : roundTime
      };
      return newStats;
    });
    
    // Po 1.5s feedback pokračuj dalším kolem nebo ukonči hru
    setTimeout(() => {
      setGameState(prev => {
        const newScore = isCorrect ? prev.score + 1 : prev.score;
        const newLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1);
        const newRound = prev.round + 1;

        if (newLives === 0 || newRound > TOTAL_ROUNDS) {
          // Finální statistiky
          setGameStats(prevStats => ({
            ...prevStats,
            finalScore: newScore
          }));
          
          return {
            ...prev,
            score: newScore,
            lives: newLives,
            showResult: true,
            gamePhase: 'ended',
            isGameActive: false,
            showCorrectAnswer: false
          };
        }

        // Pokračujeme dalším kolem
        return {
          ...prev,
          score: newScore,
          lives: newLives,
          round: newRound,
          gamePhase: 'playing',
          timeLeft: TIME_LIMIT,
          showCorrectAnswer: false
        };
      });

      if (gameState.round < TOTAL_ROUNDS && (isCorrect ? gameState.lives : gameState.lives - 1) > 0) {
        // Další kolo začne ihned bez countdown
        setCurrentRound(generateRound());
        setRoundKey(prev => prev + 1); // Přegenerování pozic
        setRoundStartTime(Date.now());
      }
      setFeedback(null);
    }, 1500);
  }, [currentRound, gameState.gamePhase, gameState.round, gameState.lives, roundStartTime, generateRound, TOTAL_ROUNDS, TIME_LIMIT]);

  // Klik na kontejner - hlavní herní interakce
  const handleContainerClick = (container: 'left' | 'right') => {
    if (gameState.gamePhase === 'playing') {
      handleAnswer(container);
    }
  };

  // Render objektů v kontejneru s uloženými pozicemi
  // Vykresluje objekty na přesných grid pozicích s rotací
  const renderObjects = (count: number, type: typeof OBJECT_TYPES[0], containerId: 'left' | 'right') => {
    const positions = objectPositions[containerId];
    
    const objects = [];
    for (let i = 0; i < count; i++) {
      const pos = positions[i] || { x: 0, y: 0, rotation: 0 };
      
      // Velikost objektů podle rozlišení - 100% větší
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 768;
      const objectSize = isMobile ? 84 : isTablet ? 110 : 140; // 100% větší symboly
      
      objects.push(
        <div 
          key={`${containerId}-${roundKey}-${i}`} 
          className="absolute select-none pointer-events-none"
          style={{
            left: `${pos.x + (window.innerWidth >= 768 ? 30 : 10)}px`, // větší padding na desktopu
            top: `${pos.y + (window.innerWidth >= 768 ? 30 : 10)}px`,
            transform: `rotate(${pos.rotation}deg)`,
            zIndex: i + 1,
            position: 'absolute', // zajištění, že se objekty nepohybují
            width: `${objectSize}px`,
            height: `${objectSize}px`
          }}
        >
          <ImageWithFallback 
            src={type.svgUrl} 
            alt={type.name} 
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    return objects;
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col" style={{ backgroundColor: BACKGROUND_COLOR }}>
      {/* Countdown overlay na začátku hry */}
      <AnimatePresence>
        {gameState.gamePhase === 'countdown' && (
          <CountdownOverlay 
            isVisible={true}
            onComplete={handleCountdownComplete}
          />
        )}
      </AnimatePresence>

      {/* Hlavní herní oblast - kontejnery a UI */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8 p-2 md:p-8">
        {currentRound && gameState.gamePhase === 'playing' && (
          <>
            {/* Hlavní nadpis hry */}
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl text-black">
                Čeho je více?
              </h1>
            </div>

            {/* Layout pro všechny velikosti obrazovky - dva kontejnery vedle sebe */}
            <div className="flex gap-4 md:gap-8 items-center justify-center w-full max-w-6xl px-4">
              {/* Levý kontejner - klikatelný */}
              <motion.div 
                className="bg-white rounded-xl md:rounded-2xl border-4 border-[#e2dcb3] relative overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
                style={{ 
                  width: window.innerWidth < 640 ? '160px' : window.innerWidth < 768 ? '192px' : '480px',
                  height: window.innerWidth < 640 ? '240px' : window.innerWidth < 768 ? '224px' : '460px'
                }}
                onClick={() => handleContainerClick('left')}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-blue-100 opacity-0 hover:opacity-20 transition-opacity" />
                {renderObjects(currentRound.leftContainer.count, currentRound.leftContainer.type, 'left')}
              </motion.div>

              {/* Pravý kontejner - klikatelný */}
              <motion.div 
                className="bg-white rounded-xl md:rounded-2xl border-4 border-[#e2dcb3] relative overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
                style={{ 
                  width: window.innerWidth < 640 ? '160px' : window.innerWidth < 768 ? '192px' : '480px',
                  height: window.innerWidth < 640 ? '240px' : window.innerWidth < 768 ? '224px' : '460px'
                }}
                onClick={() => handleContainerClick('right')}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-blue-100 opacity-0 hover:opacity-20 transition-opacity" />
                {renderObjects(currentRound.rightContainer.count, currentRound.rightContainer.type, 'right')}
              </motion.div>
            </div>

            {/* UI prvky pod kontejnery - responzivní design */}
            <div className="w-full max-w-4xl">
              {/* Mobilní UI - kompaktní layout */}
              <div className="flex md:hidden justify-between items-center px-4 py-3 bg-white rounded-xl shadow-sm">
                {/* Kolo */}
                <div className="text-sm text-gray-600">
                  {gameState.round}/{TOTAL_ROUNDS}
                </div>
                
                {/* Skóre */}
                <div className="text-sm text-green-600">
                  Skóre: {gameState.score}
                </div>
                
                {/* Srdíčka - životy */}
                <div className="flex gap-1">
                  {Array.from({ length: MAX_LIVES }).map((_, index) => (
                    <Heart
                      key={index}
                      size={16}
                      className={`${
                        index < gameState.lives 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Časový indikátor */}
                {gameState.gamePhase === 'playing' && (
                  <div className="w-16">
                    <TimeIndicator timeLeft={gameState.timeLeft} totalTime={TIME_LIMIT} />
                  </div>
                )}
                
                {/* Restart tlačítko */}
                <button
                  onClick={startNewGame}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                >
                  <RotateCcw size={12} />
                  Restart
                </button>
              </div>

              {/* Desktop UI - rozšířený layout */}
              <div className="hidden md:flex justify-between items-center px-6 py-4 bg-white rounded-xl shadow-sm">
                {/* Levá strana - Kolo a skóre */}
                <div className="flex items-center gap-6">
                  <div className="text-lg text-gray-600">
                    Kolo: {gameState.round}/{TOTAL_ROUNDS}
                  </div>
                  <div className="text-lg text-green-600">
                    Skóre: {gameState.score}
                  </div>
                </div>
                
                {/* Střed - Časový indikátor */}
                {gameState.gamePhase === 'playing' && (
                  <div className="w-48">
                    <TimeIndicator timeLeft={gameState.timeLeft} totalTime={TIME_LIMIT} />
                  </div>
                )}
                
                {/* Pravá strana - Srdíčka a restart */}
                <div className="flex items-center gap-6">
                  <div className="flex gap-1">
                    {Array.from({ length: MAX_LIVES }).map((_, index) => (
                      <Heart
                        key={index}
                        size={24}
                        className={`${
                          index < gameState.lives 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={startNewGame}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <RotateCcw size={16} />
                    Nová hra
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Obrazovka správně/špatně - feedback overlay */}
        <AnimatePresence>
          {gameState.showCorrectAnswer && (
            <GameResultScreen
              isSuccess={feedback === 'correct'}
              successText="SPRÁVNĚ!"
              failureText="ŠPATNĚ!"
              autoHideDuration={1.5}
              showContinueButton={false}
              displayType="correctAnswer"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Konečná výsledková obrazovka s videem */}
      {gameState.showResult && (
        <GameResultScreen
          isSuccess={gameState.score >= Math.ceil(TOTAL_ROUNDS * 0.6)} // 60% úspěšnost
          successText="VÝBORNĚ!"
          failureText="ZKUS TO ZNOVU!"
          showContinueButton={true}
          displayType="gameComplete"
          onContinue={startNewGame}
        />
      )}
    </div>
  );
}