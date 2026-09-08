import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCcw } from 'lucide-react';
import { CountdownOverlay } from './CountdownOverlay';
import { TimeIndicator } from './TimeIndicator';
import { GameResultScreen } from './GameResultScreen';
import { ImageWithFallback } from './figma/ImageWithFallback';

// SVG symboly z Supabase
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

// Typy objektů s SVG symboly
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

interface QuantityComparisonGameProps {
  settings?: Record<string, any>;
}

interface GameState {
  round: number;
  score: number;
  lives: number;
  timeLeft: number;
  isGameActive: boolean;
  showResult: boolean;
  gamePhase: 'countdown' | 'playing' | 'feedback' | 'ended';
  showCorrectAnswer: boolean;
}

interface GameStats {
  totalRounds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeouts: number;
  averageTimePerRound: number;
  finalScore: number;
}

interface RoundData {
  leftContainer: { count: number; type: typeof OBJECT_TYPES[0] };
  rightContainer: { count: number; type: typeof OBJECT_TYPES[0] };
  correctAnswer: 'left' | 'right';
  // Pro clicking módy
  targetCount?: number; // kolik má uživatel naklikat
  clickedCount?: number; // kolik už naklikal
  clickableType?: typeof OBJECT_TYPES[0]; // typ objektu pro klikání
}

export function QuantityComparisonGame({ settings }: QuantityComparisonGameProps) {
  // Debug: Vypsat nastavení do konzole
  console.log('QuantityComparisonGame settings:', settings);
  
  // Konstanty hry z nastavení nebo výchozí hodnoty
  const TOTAL_ROUNDS = settings?.totalRounds || 10;
  const TIME_LIMIT = settings?.timeLimit || 15;
  const MAX_LIVES = settings?.maxLives || 3;
  const TIME_BASED_GAME = settings?.timeBasedGame !== false; // Výchozí: true
  
  // NOVÉ: Podpora více herních módů současně
  const GAME_MODES = settings?.gameMode || ['compare']; // Array herních módů
  const isGameModesArray = Array.isArray(GAME_MODES);
  const availableGameModes = isGameModesArray ? GAME_MODES : [GAME_MODES]; // Zajisti, že je to vždy array
  
  // Přidáme stav pro aktuální herní mód v kole
  const [currentGameMode, setCurrentGameMode] = useState<string>(availableGameModes[0]);
  
  // OPRAVA: Správné čtení rozsahu z objectRange (podle gameRegistry)
  let MAX_OBJECTS, MIN_OBJECTS;
  if (settings?.objectRange && Array.isArray(settings.objectRange)) {
    [MIN_OBJECTS, MAX_OBJECTS] = settings.objectRange;
  } else {
    // Fallback na jiné možné formáty nebo výchozí hodnoty
    MAX_OBJECTS = settings?.maxObjects || 10;
    MIN_OBJECTS = settings?.minObjects || 3;
  }
  
  const MAX_DIFFERENCE = settings?.maxDifference || 3;

  const BACKGROUND_COLOR = settings?.backgroundColor || '#F5F1E8';
  
  // Debug: Vypsat finální hodnoty
  console.log('Final game settings:', {
    TOTAL_ROUNDS,
    TIME_LIMIT, 
    MAX_LIVES,
    MAX_OBJECTS,
    MIN_OBJECTS,
    MAX_DIFFERENCE,
    TIME_BASED_GAME,
    GAME_MODES,
    availableGameModes,
    currentGameMode,
    objectRange: settings?.objectRange
  });
  
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

  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [roundKey, setRoundKey] = useState(0); // Pro přegenerování pozic
  const [objectPositions, setObjectPositions] = useState<{
    left: Array<{x: number, y: number, rotation: number}>,
    right: Array<{x: number, y: number, rotation: number}>
  }>({ left: [], right: [] });
  const [gameStats, setGameStats] = useState<GameStats>({
    totalRounds: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeouts: 0,
    averageTimePerRound: 0,
    finalScore: 0
  });
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  
  // Stav pro clicking módy  
  const [clickedObjects, setClickedObjects] = useState<Array<{id: number, x: number, y: number, rotation: number, clicked: boolean}>>([]);

  // Spuštění hry při prvním renderu
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pouze při prvním renderu - ignoruje warning o dependencies

  // Generování grid-based pozic pro rovnoměrné rozmístění
  const generateGridPositions = useCallback((count: number, containerWidth: number, containerHeight: number, objectSize: number) => {
    const positions = [];
    
    if (count === 0) return positions;
    
    // Vypočítej optimální grid podle počtu objektů
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);
    
    // Pro lepší využití prostoru, zkus různé kombinace
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
    
    // Umísti objekty do grid buněk
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
  const generateRound = useCallback((): RoundData => {
    // NOVÉ: Náhodně vyber herní mód z dostupných módů na začátku každého kola
    const randomGameMode = availableGameModes[Math.floor(Math.random() * availableGameModes.length)];
    setCurrentGameMode(randomGameMode);
    
    console.log('Generating new round with game mode:', randomGameMode, 'from available:', availableGameModes);
    
    if (randomGameMode === 'clickMore' || randomGameMode === 'clickLess') {
      return generateClickingRound();
    }
    
    // Původní logika pro 'compare' mód
    // Generuj první číslo
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

    let correctAnswer: 'left' | 'right';
    if (leftCount > rightCount) correctAnswer = 'left';
    else correctAnswer = 'right';

    // Vyber dva různé typy objektů
    const leftType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    let rightType;
    do {
      rightType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    } while (rightType.name === leftType.name); // Zajisti, že jsou různé

    // Generuj pozice pro objekty
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 768;
    
    const containerWidth = isMobile ? Math.min(window.innerWidth * 0.8, 320) : isTablet ? 192 : 480; // 80% šířky na mobilu, max 320px
    const containerHeight = isMobile ? Math.min(window.innerWidth * 0.6, 240) : isTablet ? 224 : 460; // proporcionální výška na mobilu - zvětšeno o 20%
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
  }, [generateGridPositions, MAX_OBJECTS, MIN_OBJECTS, MAX_DIFFERENCE, availableGameModes]);
  
  // Generování kola pro clicking módy
  const generateClickingRound = useCallback((): RoundData => {
    const leftCount = Math.floor(Math.random() * (MAX_OBJECTS - MIN_OBJECTS + 1)) + MIN_OBJECTS;
    const leftType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    
    // OPRAVA: Pro clicking módy je targetCount pouze referenční číslo z levého kontejneru
    const targetCount = leftCount; // Prostě počet vlevo
    
    // Debug log pro sledování hodnot
    console.log('Clicking round generated:', {
      currentGameMode,
      leftCount,
      targetCount,
      shouldClick: currentGameMode === 'clickMore' ? `více než ${leftCount}` : `méně než ${leftCount}`
    });
    
    // Generuj pozice pro levý kontejner
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 768;
    
    const containerWidth = isMobile ? Math.min(window.innerWidth * 0.8, 320) : isTablet ? 192 : 480;
    const containerHeight = isMobile ? Math.min(window.innerWidth * 0.6, 240) : isTablet ? 224 : 460;
    const objectSize = isMobile ? 84 : isTablet ? 110 : 140;
    const margin = isMobile ? 20 : 60;
    
    const leftPositions = generateGridPositions(leftCount, containerWidth - margin, containerHeight - margin, objectSize);
    
    // Prázdný pravý kontejner pro klikání
    setObjectPositions({
      left: leftPositions,
      right: []
    });
    
    // Reset clicked objects pro nové kolo
    setClickedObjects([]);
    
    return {
      leftContainer: { count: leftCount, type: leftType },
      rightContainer: { count: 0, type: leftType }, // použij stejný typ objektu
      correctAnswer: 'right', // úspěch se určí podle počtu naklikání
      targetCount,
      clickedCount: 0,
      clickableType: leftType
    };
  }, [generateGridPositions, MAX_OBJECTS, MIN_OBJECTS, currentGameMode]);

  // Spuštění nové hry
  const startNewGame = useCallback(() => {
    setGameState({
      round: 1,
      score: 0,
      lives: MAX_LIVES,
      timeLeft: TIME_LIMIT,
      isGameActive: false,
      showResult: false,
      gamePhase: TIME_BASED_GAME ? 'countdown' : 'playing',  // Pokud není hra na čas, jdi rovnou na 'playing'
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
    
    // Pokud není hra na čas, spusť ihned první kolo
    if (!TIME_BASED_GAME) {
      const newRound = generateRound();
      setCurrentRound(newRound);
      setRoundStartTime(Date.now());
      setGameState(prev => ({ ...prev, isGameActive: true }));
    }
  }, [MAX_LIVES, TIME_LIMIT, TIME_BASED_GAME, generateRound]);

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

  // Timer pro kolo - pouze pokud je hra na čas
  useEffect(() => {
    if (TIME_BASED_GAME && gameState.isGameActive && gameState.gamePhase === 'playing' && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (TIME_BASED_GAME && gameState.timeLeft === 0 && gameState.gamePhase === 'playing') {
      // Čas vypršel - pouze při hře na čas
      handleAnswer('timeout');
    }
  }, [gameState.timeLeft, gameState.isGameActive, gameState.gamePhase, TIME_BASED_GAME]);

  // Zpracování odpovědi
  const handleAnswer = useCallback((answer: 'left' | 'right' | 'timeout') => {
    if (!currentRound || gameState.gamePhase !== 'playing') return;

    // Timeout lze zavolat pouze pokud je hra na čas
    if (answer === 'timeout' && !TIME_BASED_GAME) return;

    let isCorrect = false;
    
    // Pro clicking módy zkontroluj počet naklikaných objektů
    if (currentGameMode === 'clickMore' || currentGameMode === 'clickLess') {
      const currentClickedCount = currentRound.clickedCount || 0;
      const targetCount = currentRound.targetCount || 0;
      
      // Debug log pro vyhodnocování
      console.log('Evaluating clicking answer:', {
        currentGameMode,
        currentClickedCount,
        targetCount,
        leftCount: currentRound.leftContainer.count,
        condition: currentGameMode === 'clickMore' ? `${currentClickedCount} > ${targetCount}` : `${currentClickedCount} < ${targetCount} && ${currentClickedCount} > 0`,
        result: currentGameMode === 'clickMore' ? currentClickedCount > targetCount : (currentClickedCount < targetCount && currentClickedCount > 0)
      });
      
      if (currentGameMode === 'clickMore') {
        isCorrect = currentClickedCount > targetCount; // OPRAVA: musí být větší, ne rovno
      } else { // clickLess
        isCorrect = currentClickedCount < targetCount && currentClickedCount > 0; // OPRAVA: musí být menší, ne rovno
      }
    } else {
      // Původní logika pro compare mód
      isCorrect = answer === currentRound.correctAnswer && answer !== 'timeout';
    }
    
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
          timeLeft: TIME_BASED_GAME ? TIME_LIMIT : prev.timeLeft, // Reset času pouze pokud je hra na čas
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
  }, [currentRound, gameState.gamePhase, gameState.round, gameState.lives, roundStartTime, generateRound, TOTAL_ROUNDS, TIME_LIMIT, TIME_BASED_GAME]);

  // Klik na kontejner
  const handleContainerClick = (container: 'left' | 'right', event?: React.MouseEvent) => {
    if (gameState.gamePhase === 'playing') {
      // Pro clicking módy - pravý kontejner slouží k naklikávání
      if ((currentGameMode === 'clickMore' || currentGameMode === 'clickLess') && container === 'right') {
        handleRightContainerClick(event);
      } else {
        // Pro compare mód nebo levý kontejner
        handleAnswer(container);
      }
    }
  };

  // Klik na prázdný kontejner pro přidání objektu
  const handleRightContainerClick = (event?: React.MouseEvent) => {
    if (!currentRound || gameState.gamePhase !== 'playing') return;
    if (currentGameMode !== 'clickMore' && currentGameMode !== 'clickLess') return;

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 768;
    const containerWidth = isMobile ? Math.min(window.innerWidth * 0.8, 320) : isTablet ? 192 : 480;
    const containerHeight = isMobile ? Math.min(window.innerWidth * 0.6, 240) : isTablet ? 224 : 460;
    const objectSize = isMobile ? 84 : isTablet ? 110 : 140;
    const margin = isMobile ? 20 : 60;

    // Spočítej nový počet objektů
    const newClickedCount = (currentRound.clickedCount || 0) + 1;
    
    let x, y;
    
    if (event) {
      // Získej pozici kliknutí relativně k kontejneru
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      
      // Polovina velikosti objektu pro vycentrování na kliknutí
      const halfObjectSize = objectSize / 2;
      
      // Padding kontejneru (z renderObjects)
      const containerPadding = window.innerWidth >= 768 ? 30 : 10;
      
      // Vypočítej pozici tak, aby byl objekt vycentrovaný na kliknutí
      // Odečti containerPadding, protože se přičítá později v renderObjects
      x = Math.min(Math.max(clickX - halfObjectSize - containerPadding, 0), containerWidth - objectSize - containerPadding);
      y = Math.min(Math.max(clickY - halfObjectSize - containerPadding, 0), containerHeight - objectSize - containerPadding);
    } else {
      // Fallback na náhodnou pozici (pokud event není k dispozici)
      const padding = isMobile ? 10 : 30;
      const availableWidth = containerWidth - margin - objectSize;
      const availableHeight = containerHeight - margin - objectSize;
      
      x = Math.random() * availableWidth + padding;
      y = Math.random() * availableHeight + padding;
    }
    
    const rotation = Math.random() * 80 - 40;

    // Přidej nový objekt do pozic
    const newPositions = [...objectPositions.right, { x, y, rotation }];
    setObjectPositions(prev => ({
      ...prev,
      right: newPositions
    }));

    // Aktualizuj currentRound
    setCurrentRound(prev => prev ? {
      ...prev,
      clickedCount: newClickedCount,
      rightContainer: { ...prev.rightContainer, count: newClickedCount }
    } : null);
  }; 

  // Tlačítko dokončit pro clicking módy
  const handleSubmitClicking = () => {
    if (currentGameMode === 'clickMore' || currentGameMode === 'clickLess') {
      handleAnswer('right'); // Vyhodnotí podle počtu naklikání
    }
  }; 

  // Render objektů v kontejneru s uloženými pozicemi
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
      {/* Countdown overlay */}
      <AnimatePresence>
        {TIME_BASED_GAME && gameState.gamePhase === 'countdown' && (
          <CountdownOverlay 
            isVisible={true}
            onComplete={handleCountdownComplete}
          />
        )}
      </AnimatePresence>

      {/* Hlavní herní oblast */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8 p-2 md:p-8">
        {currentRound && gameState.gamePhase === 'playing' && (
          <>
            {/* Hlavní nadpis */}
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl text-black">
                {currentGameMode === 'compare' && 'Čeho je více?'}
                {currentGameMode === 'clickMore' && 'Naklikej více!'}
                {currentGameMode === 'clickLess' && 'Naklikej méně!'}
              </h1>
            </div>

            {/* Layout - mobilní: pod sebou, desktop: vedle sebe */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full max-w-6xl px-4">
              {/* Levý kontejner - klikatelný */}
              <motion.div 
                className="bg-white rounded-xl md:rounded-2xl border-4 border-[#e2dcb3] relative overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform w-[80vw] md:w-auto"
                style={{ 
                  width: window.innerWidth < 640 ? '80vw' : window.innerWidth < 768 ? '192px' : '480px',
                  height: window.innerWidth < 640 ? '60vw' : window.innerWidth < 768 ? '224px' : '460px',
                  maxWidth: window.innerWidth < 640 ? '320px' : 'none'
                }}
                onClick={(e) => handleContainerClick('left', e)}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-blue-100 opacity-0 hover:opacity-20 transition-opacity" />
                {renderObjects(currentRound.leftContainer.count, currentRound.leftContainer.type, 'left')}
              </motion.div>

              {/* Pravý kontejner - klikatelný */}
              <motion.div 
                className={`bg-white rounded-xl md:rounded-2xl border-4 relative overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform w-[80vw] md:w-auto ${
                  (currentGameMode === 'clickMore' || currentGameMode === 'clickLess') 
                    ? 'border-green-400' 
                    : 'border-[#e2dcb3]'
                }`}
                style={{ 
                  width: window.innerWidth < 640 ? '80vw' : window.innerWidth < 768 ? '192px' : '480px',
                  height: window.innerWidth < 640 ? '60vw' : window.innerWidth < 768 ? '224px' : '460px',
                  maxWidth: window.innerWidth < 640 ? '320px' : 'none'
                }}
                onClick={(e) => handleContainerClick('right', e)}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-blue-100 opacity-0 hover:opacity-20 transition-opacity" />
                {renderObjects(currentRound.rightContainer.count, currentRound.rightContainer.type, 'right')}
                
                {/* Placeholder text pro clicking módy */}
                {(currentGameMode === 'clickMore' || currentGameMode === 'clickLess') && (currentRound.clickedCount || 0) === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-400">
                      <div className="text-2xl md:text-4xl mb-2">👆</div>
                      <div className="text-sm md:text-base">Klikni pro přidání</div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Tlačítko dokončit pro clicking módy */}
            {(currentGameMode === 'clickMore' || currentGameMode === 'clickLess') && (
              <div className="mt-4">
                <button
                  onClick={handleSubmitClicking}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg transition-colors text-lg"
                  disabled={!currentRound?.clickedCount || currentRound.clickedCount === 0}
                >
                  Dokončit
                </button>
              </div>
            )}

            {/* UI prvky pod kontejnery */}
            <div className="w-full max-w-4xl">
              {/* Mobilní UI - zvětšeno */}
              <div className="flex md:hidden justify-between items-center px-4 py-4 bg-white rounded-xl shadow-sm">
                {/* Kolo */}
                <div className="text-base font-medium text-gray-700">
                  {gameState.round}/{TOTAL_ROUNDS}
                </div>
                
                {/* Skóre */}
                <div className="text-base font-medium text-green-600">
                  Skóre: {gameState.score}
                </div>
                
                {/* Srdíčka */}
                <div className="flex gap-1">
                  {Array.from({ length: MAX_LIVES }).map((_, index) => (
                    <Heart
                      key={index}
                      size={20}
                      className={`${
                        index < gameState.lives 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Časov indikátor */}
                {TIME_BASED_GAME && gameState.gamePhase === 'playing' && (
                  <div className="w-20">
                    <TimeIndicator timeLeft={gameState.timeLeft} totalTime={TIME_LIMIT} />
                  </div>
                )}
                
                {/* Restart tlačítko */}
                <button
                  onClick={startNewGame}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <RotateCcw size={16} />
                  Restart
                </button>
              </div>

              {/* Desktop UI */}
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
                {TIME_BASED_GAME && gameState.gamePhase === 'playing' && (
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

        {/* Obrazovka správně/špatně */}
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