import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCcw, Music, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { CountdownOverlay } from './CountdownOverlay';
import { GameResultScreen } from './GameResultScreen';
import { NumberRecognitionHeader } from './NumberRecognitionHeader';
import { CorrectAnswerOverlay } from './CorrectAnswerOverlay';
import { useAudio } from './AudioManager';
import { ImageWithFallback } from './figma/ImageWithFallback';

// SVG symboly z Supabase (převzato z QuantityComparisonGame)
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

// Typy objektů s SVG symboly (převzato z QuantityComparisonGame)
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

// Výchozí konstanty hry (pro zpětnou kompatibilitu)
const DEFAULT_TOTAL_ROUNDS = 10;
const DEFAULT_TIME_LIMIT = 30; // sekund na kolo
const DEFAULT_MAX_LIVES = 3;
const DEFAULT_MIN_NUMBER = 1;
const DEFAULT_MAX_NUMBER = 9;
const DEFAULT_CHALLENGE_TYPES = ['written', 'dots', 'objects', 'sound', 'blink'];
const DEFAULT_TASK_TYPES = ['tap', 'select', 'dots', 'click', 'tally', 'dice'];

// Typy zadání
type ChallengeType = 'written' | 'dots' | 'objects' | 'sound' | 'blink';
// Typy úkolů  
type TaskType = 'tap' | 'select' | 'dots' | 'click' | 'tally' | 'dice';

interface GameSettings {
  minNumber?: number;
  maxNumber?: number;
  totalRounds?: number;
  timeLimit?: number;
  maxLives?: number;
  challengeTypes?: ChallengeType[];
  taskTypes?: TaskType[];
  backgroundColor?: string;
  numberRange?: [number, number];
}

interface NumberRecognitionGameProps {
  settings?: GameSettings;
}

interface GameState {
  round: number;
  score: number;
  lives: number;
  timeLeft: number;
  currentNumber: number;
  challengeType: ChallengeType;
  taskType: TaskType;
  isGameActive: boolean;
  showResult: boolean;
  gamePhase: 'countdown' | 'playing' | 'feedback' | 'ended';
  tapCount: number;
  selectedNumber: number | null;
  isPlayingSound: boolean;
  currentObjectType: typeof OBJECT_TYPES[0];
  isCompletingTask: boolean;
  clickedDots: boolean[];
  blinkCount: number;
  isBlinking: boolean;
  guessedBlinks: number | null;
  clickedObjects: Array<{x: number, y: number, objectType: typeof OBJECT_TYPES[0]}>; // Nový stav pro objekty
  clickObjectType: typeof OBJECT_TYPES[0];
  showCorrectAnswer: boolean;
  lastAnswerWasCorrect: boolean;
  tallyCount: number; // Nový stav pro počet čárek v úlu
  diceValue: number; // Nový stav pro hodnotu na kostce (0-6)
}

interface GameStats {
  totalRounds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeouts: number;
  finalScore: number;
}

export function NumberRecognitionGame({ settings = {} }: NumberRecognitionGameProps) {
  // Debug: Vypsat nastavení do konzole
  console.log('NumberRecognitionGame settings:', settings);
  
  // OPRAVA: Správné čtení nastavení numberRange z konfigurace
  let MIN_NUMBER, MAX_NUMBER;
  if (settings.numberRange && Array.isArray(settings.numberRange)) {
    [MIN_NUMBER, MAX_NUMBER] = settings.numberRange;
  } else {
    // Fallback na individuální nastavení nebo výchozí hodnoty
    MIN_NUMBER = settings.minNumber ?? DEFAULT_MIN_NUMBER;
    MAX_NUMBER = settings.maxNumber ?? DEFAULT_MAX_NUMBER;
  }

  // OPRAVA: Správné čtení challengeTypes a taskTypes z konfigurace
  let ACTIVE_CHALLENGE_TYPES = DEFAULT_CHALLENGE_TYPES;
  let ACTIVE_TASK_TYPES = DEFAULT_TASK_TYPES;
  
  if (settings.challengeTypes && Array.isArray(settings.challengeTypes) && settings.challengeTypes.length > 0) {
    ACTIVE_CHALLENGE_TYPES = settings.challengeTypes;
  }
  
  if (settings.taskTypes && Array.isArray(settings.taskTypes) && settings.taskTypes.length > 0) {
    ACTIVE_TASK_TYPES = settings.taskTypes;
  }

  // Aplikování nastavení s fallback na výchozí hodnoty
  const gameConfig = {
    TOTAL_ROUNDS: settings.totalRounds ?? DEFAULT_TOTAL_ROUNDS,
    TIME_LIMIT: settings.timeLimit ?? DEFAULT_TIME_LIMIT,
    MAX_LIVES: settings.maxLives ?? DEFAULT_MAX_LIVES,
    MIN_NUMBER: MIN_NUMBER,
    MAX_NUMBER: MAX_NUMBER,
    CHALLENGE_TYPES: ACTIVE_CHALLENGE_TYPES,
    TASK_TYPES: ACTIVE_TASK_TYPES
  };
  
  // Debug: Vypsat finální hodnoty
  console.log('Final NumberRecognition game config:', {
    ...gameConfig,
    originalNumberRange: settings.numberRange,
    originalChallengeTypes: settings.challengeTypes,
    originalTaskTypes: settings.taskTypes
  });

  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    score: 0,
    lives: gameConfig.MAX_LIVES,
    timeLeft: gameConfig.TIME_LIMIT,
    currentNumber: 1,
    challengeType: 'written',
    taskType: 'select',
    isGameActive: false,
    showResult: false,
    gamePhase: 'countdown',
    tapCount: 0,
    selectedNumber: null,
    isPlayingSound: false,
    currentObjectType: OBJECT_TYPES[0],
    clickObjectType: OBJECT_TYPES[0],
    isCompletingTask: false,
    clickedDots: Array(16).fill(false),
    blinkCount: 0,
    isBlinking: false,
    guessedBlinks: null,
    clickedObjects: [],
    showCorrectAnswer: false,
    lastAnswerWasCorrect: false,
    tallyCount: 0, // Nový stav pro počet čárek v úlu
    diceValue: 0 // Nový stav pro hodnotu na kostce (0-6)
  });

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalRounds: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeouts: 0,
    finalScore: 0
  });

  // Stav pro pozice objektů (převzato z QuantityComparisonGame)
  const [objectPositions, setObjectPositions] = useState<Array<{x: number, y: number, rotation: number}>>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializace audio contextu
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    const handleFirstInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, []);

  // Funkce pro přehrání pípnutí
  const playBeep = (count: number) => {
    if (!audioContextRef.current) return;

    setGameState(prev => ({ ...prev, isPlayingSound: true }));
    
    let currentBeep = 0;
    const playNextBeep = () => {
      if (currentBeep >= count) {
        setGameState(prev => ({ ...prev, isPlayingSound: false }));
        return;
      }

      const oscillator = audioContextRef.current!.createOscillator();
      const gainNode = audioContextRef.current!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current!.currentTime + 0.3);
      
      currentBeep++;
      setTimeout(playNextBeep, 1000); // Delší rozestup - 1 sekunda
    };

    playNextBeep();
  };

  // Generování grid-based pozic pro rovnoměrné rozmístění (převzato z QuantityComparisonGame)
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

  // Generování nového kola - POUŽÍVÁ NASTAVENÍ
  const generateRound = useCallback(() => {
    const number = Math.floor(Math.random() * (gameConfig.MAX_NUMBER - gameConfig.MIN_NUMBER + 1)) + gameConfig.MIN_NUMBER;
    
    const challengeType = gameConfig.CHALLENGE_TYPES[Math.floor(Math.random() * gameConfig.CHALLENGE_TYPES.length)];
    const taskType = gameConfig.TASK_TYPES[Math.floor(Math.random() * gameConfig.TASK_TYPES.length)];
    
    // Fixní typ objektu pro celé kolo
    const objectType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    const clickObjectType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];

    // Generuj pozice objektů pokud je výzva typu 'objects'
    if (challengeType === 'objects') {
      // Rozměry kontejneru pro objekty - OPRAVENÉ ROZMĚRY
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 768;
      
      // Skutečná vnitřní plocha kontejneru (bez paddingu)
      const containerWidth = isMobile ? 286 : isTablet ? 451 : 583; // celková šířka minus padding (2x32px)
      const containerHeight = isMobile ? 308 : isTablet ? 421 : 433; // celková výška minus padding (2x32px + top 48px)
      
      // NOVÝ: Adaptivní velikost objektů podle počtu - větší o dalších 30% (celkem 169% zvětšení)
      // Základní velikosti zvětšené o 69% (1.3 * 1.3 = 1.69)
      let baseSize = isMobile ? 118 : isTablet ? 152 : 203; // 70*1.69, 90*1.69, 120*1.69
      
      // DALŠÍ 30% ZVĚTŠENÍ - celkem nyní 2.2x původní velikosti (1.69 * 1.3 = 2.197)
      baseSize = baseSize * 1.3;
      
      // Adaptivní redukce podle počtu objektů
      let objectSize;
      if (number === 1) {
        objectSize = baseSize; // Jeden objekt = plná velikost
      } else if (number <= 3) {
        objectSize = baseSize * 0.9; // 2-3 objekty = 90%
      } else if (number <= 5) {
        objectSize = baseSize * 0.8; // 4-5 objektů = 80%
      } else if (number <= 7) {
        objectSize = baseSize * 0.7; // 6-7 objektů = 70%
      } else {
        objectSize = baseSize * 0.6; // 8+ objektů = 60%
      }
      
      // Bezpečnostní margin pro výpočet objektů
      const safetyMargin = Math.max(10, objectSize * 0.1);
      const positions = generateGridPositions(number, containerWidth - safetyMargin * 2, containerHeight - safetyMargin * 2, objectSize);
      setObjectPositions(positions);
    } else {
      // Pro ostatní typy výzev vynuluj pozice
      setObjectPositions([]);
    }

    setGameState(prev => ({
      ...prev,
      currentNumber: number,
      challengeType,
      taskType,
      tapCount: 0,
      selectedNumber: null,
      timeLeft: gameConfig.TIME_LIMIT,
      currentObjectType: objectType,
      clickObjectType: clickObjectType,
      isCompletingTask: false,
      clickedDots: Array(16).fill(false),
      blinkCount: 0,
      isBlinking: false,
      guessedBlinks: null,
      clickedObjects: [],
      tallyCount: 0, // Nový stav pro počet čárek v úlu
      diceValue: 0 // Nový stav pro hodnotu na kostce (0-6)
    }));
  }, [gameConfig, generateGridPositions]);

  // Spuštění nové hry - POUŽÍVÁ NASTAVENÍ
  const startNewGame = useCallback(() => {
    setGameState({
      round: 1,
      score: 0,
      lives: gameConfig.MAX_LIVES,
      timeLeft: gameConfig.TIME_LIMIT,
      currentNumber: 1,
      challengeType: 'written',
      taskType: 'select',
      isGameActive: false,
      showResult: false,
      gamePhase: 'countdown',
      tapCount: 0,
      selectedNumber: null,
      isPlayingSound: false,
      currentObjectType: OBJECT_TYPES[0],
      clickObjectType: OBJECT_TYPES[0],
      isCompletingTask: false,
      clickedDots: Array(16).fill(false),
      blinkCount: 0,
      isBlinking: false,
      guessedBlinks: null,
      clickedObjects: [],
      showCorrectAnswer: false,
      lastAnswerWasCorrect: false,
      tallyCount: 0, // Inicializace pro nový mód úlů
      diceValue: 0 // Inicializace pro nový mód kostek
    });
    setFeedback(null);
    setGameStats({
      totalRounds: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeouts: 0,
      finalScore: 0
    });
  }, [gameConfig]);

  // Spuštění hry po main countdown
  const handleCountdownComplete = useCallback(() => {
    // Přehrání zvuku spuštění hry
    playSound('gameStart');
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'playing', 
      isGameActive: true 
    }));
    generateRound();
  }, [generateRound, playSound]);

  // Timer pro kolo
  useEffect(() => {
    if (gameState.isGameActive && gameState.gamePhase === 'playing' && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && gameState.gamePhase === 'playing') {
      handleAnswer(false);
    }
  }, [gameState.timeLeft, gameState.isGameActive, gameState.gamePhase]);

  // Zpracování odpovědi - POUŽÍVÁ NASTAVENÍ
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (gameState.gamePhase !== 'playing') return;

    // Uložíme výsledek pro zobrazení overlay
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'feedback',
      showCorrectAnswer: true,
      lastAnswerWasCorrect: isCorrect
    }));

    setGameStats(prev => ({
      ...prev,
      totalRounds: prev.totalRounds + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: !isCorrect ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
      timeouts: gameState.timeLeft === 0 ? prev.timeouts + 1 : prev.timeouts
    }));

    setTimeout(() => {
      setGameState(prev => {
        const newScore = isCorrect ? prev.score + 1 : prev.score;
        const newLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1);
        const newRound = prev.round + 1;

        // OPRAVA: Místo ukončení hry se automaticky restartuje
        if (newLives === 0 || newRound > gameConfig.TOTAL_ROUNDS) {
          setGameStats(prevStats => ({ ...prevStats, finalScore: newScore }));
          
          // Zobrazí výsledkovou obrazovku na 3 sekundy, pak automatický restart
          setTimeout(() => {
            startNewGame();
          }, 3000);
          
          return {
            ...prev,
            score: newScore,
            lives: newLives,
            showResult: true,
            showCorrectAnswer: false,
            gamePhase: 'ended',
            isGameActive: false
          };
        }

        // OPRAVA: Generuj nové kolo přímo zde místo venku
        // aby se použily správné (nové) hodnoty
        setTimeout(() => generateRound(), 0);

        return {
          ...prev,
          score: newScore,
          lives: newLives,
          round: newRound,
          showCorrectAnswer: false,
          gamePhase: 'playing'
        };
      });

      setFeedback(null);
    }, 800); // ZKRÁCENO z 1500ms na 800ms pro rychlejší přechod mezi koly
  }, [gameState.gamePhase, gameState.timeLeft, generateRound, gameConfig, startNewGame]);

  // Klávesové události pro vyťukávání
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gamePhase === 'playing' && gameState.taskType === 'tap' && e.code === 'Space') {
        e.preventDefault();
        setGameState(prev => ({ ...prev, tapCount: prev.tapCount + 1 }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gamePhase, gameState.taskType]);

  // Klávesové události pro úly - šipky nahoru a dolů
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gamePhase === 'playing' && gameState.taskType === 'tally' && !gameState.isCompletingTask) {
        if (e.code === 'ArrowUp' && gameState.tallyCount < 20) {
          e.preventDefault();
          setGameState(prev => ({ ...prev, tallyCount: prev.tallyCount + 1 }));
        } else if (e.code === 'ArrowDown' && gameState.tallyCount > 0) {
          e.preventDefault();
          setGameState(prev => ({ ...prev, tallyCount: prev.tallyCount - 1 }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gamePhase, gameState.taskType, gameState.isCompletingTask, gameState.tallyCount]);

  // Klávesové události pro kostky - šipky nahoru a dolů
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gamePhase === 'playing' && gameState.taskType === 'dice' && !gameState.isCompletingTask) {
        if (e.code === 'ArrowUp' && gameState.diceValue < 9) {
          e.preventDefault();
          setGameState(prev => ({ ...prev, diceValue: prev.diceValue + 1 }));
        } else if (e.code === 'ArrowDown' && gameState.diceValue > 0) {
          e.preventDefault();
          setGameState(prev => ({ ...prev, diceValue: prev.diceValue - 1 }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gamePhase, gameState.taskType, gameState.isCompletingTask, gameState.diceValue]);

  // Spuštění blikání pro zadání 'blink'
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && gameState.challengeType === 'blink' && !gameState.isBlinking && gameState.blinkCount === 0) {
      // Začneme blikat po krátké pauze
      setTimeout(startBlinking, 1000);
    }
  }, [gameState.gamePhase, gameState.challengeType, gameState.isBlinking, gameState.blinkCount, gameState.currentNumber]);

  // Render tečkových vzorů (domino style) - POUŽÍVÁ NASTAVENÍ PRO MAXIMUM
  const renderDots = (number: number) => {
    const dots = [];
    const patterns = {
      1: [{ x: 50, y: 50 }],
      2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
      3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
      4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
      5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
      6: [{ x: 25, y: 20 }, { x: 75, y: 20 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 80 }, { x: 75, y: 80 }],
      7: [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 50, y: 35 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
      8: [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 25, y: 35 }, { x: 75, y: 35 }, { x: 25, y: 65 }, { x: 75, y: 65 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
      9: [{ x: 20, y: 15 }, { x: 50, y: 15 }, { x: 80, y: 15 }, { x: 20, y: 40 }, { x: 50, y: 40 }, { x: 80, y: 40 }, { x: 20, y: 85 }, { x: 50, y: 85 }, { x: 80, y: 85 }],
      10: [{ x: 15, y: 15 }, { x: 35, y: 15 }, { x: 65, y: 15 }, { x: 85, y: 15 }, { x: 15, y: 40 }, { x: 35, y: 40 }, { x: 65, y: 40 }, { x: 85, y: 40 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
      11: [{ x: 15, y: 10 }, { x: 35, y: 10 }, { x: 50, y: 10 }, { x: 65, y: 10 }, { x: 85, y: 10 }, { x: 15, y: 40 }, { x: 35, y: 40 }, { x: 65, y: 40 }, { x: 85, y: 40 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
      12: [{ x: 15, y: 10 }, { x: 35, y: 10 }, { x: 50, y: 10 }, { x: 65, y: 10 }, { x: 85, y: 10 }, { x: 15, y: 35 }, { x: 35, y: 35 }, { x: 65, y: 35 }, { x: 85, y: 35 }, { x: 15, y: 85 }, { x: 35, y: 85 }, { x: 65, y: 85 }]
    };

    const pattern = patterns[Math.min(number, 12) as keyof typeof patterns] || [];
    return pattern.map((dot, index) => (
      <div
        key={index}
        className="absolute w-6 h-6 md:w-16 md:h-16 bg-white rounded-full"
        style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)' }}
      />
    ));
  };

  // Render objektů s pokročilým systémem pozic a SVG (převzato z QuantityComparisonGame)
  const renderObjects = (number: number) => {
    const objectType = gameState.currentObjectType;
    const objects = [];
    
    // Kontrola, jestli máme pozice pro objekty
    if (objectPositions.length === 0 || objectPositions.length < number) {
      // Fallback na kruhové rozmístění pokud nejsou pozice dostupné
      for (let i = 0; i < number; i++) {
        const angle = (i / number) * 360;
        const radius = Math.min(40, 60 - number * 5);
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        
        objects.push(
          <div
            key={i}
            className="absolute text-6xl md:text-8xl select-none"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)'
            }}
          >
            {objectType.svgUrl ? (
              <ImageWithFallback 
                src={objectType.svgUrl} 
                alt={objectType.name} 
                className="w-11 h-11 md:w-20 md:h-20 object-contain"
              />
            ) : (
              <span className="text-6xl md:text-8xl">{objectType.emoji || '⭐'}</span>
            )}
          </div>
        );
      }
    } else {
      // OPRAVA: Použij předgenerované pozice s přesnou velikostí a správným pozicováním do levého kontejneru
      for (let i = 0; i < number; i++) {
        const pos = objectPositions[i];
        
        // Vypočítání velikosti objektů podle aktuálního počtu (stejný vzorec jako při generování)
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 768;
        
        // NOVÝ: Adaptivní velikost objektů podle počtu - větší o dalších 30% (celkem 169% zvětšení)
        // Základní velikosti zvětšené o 69% (1.3 * 1.3 = 1.69)
        let baseSize = isMobile ? 118 : isTablet ? 152 : 203; // 70*1.69, 90*1.69, 120*1.69
        
        // ZVĚTŠENÍ O 15% PRO MOBIL - celkem nyní 1.9435x původní velikosti (1.69 * 1.15 = 1.9435)
        baseSize = isMobile ? baseSize * 1.15 : baseSize * 1.3;
        
        // Adaptivní redukce podle počtu objektů
        let objectSize;
        if (number === 1) {
          objectSize = baseSize; // Jeden objekt = plná velikost
        } else if (number <= 3) {
          objectSize = baseSize * 0.9; // 2-3 objekty = 90%
        } else if (number <= 5) {
          objectSize = baseSize * 0.8; // 4-5 objektů = 80%
        } else if (number <= 7) {
          objectSize = baseSize * 0.7; // 6-7 objektů = 70%
        } else {
          objectSize = baseSize * 0.6; // 8+ objektů = 60%
        }
        
        objects.push(
          <div 
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              left: `${pos.x}px`, // OPRAVA: Pozice relativně k kontejneru bez přičítání paddingu
              top: `${pos.y}px`, // OPRAVA: Pozice relativně k kontejneru bez přičítání paddingu
              transform: `rotate(${pos.rotation}deg)`,
              zIndex: i + 1,
              width: `${objectSize}px`,
              height: `${objectSize}px`
            }}
          >
            <ImageWithFallback 
              src={objectType.svgUrl} 
              alt={objectType.name} 
              className="w-full h-full object-contain"
            />
          </div>
        );
      }
    }
    
    return objects;
  };

  // Funkce pro spuštění blikání - SPRÁVNÁ VERZE
  const startBlinking = () => {
    setGameState(prev => ({ ...prev, isBlinking: true, blinkCount: 0 }));
    
    let currentBlink = 0;
    
    const blink = () => {
      if (currentBlink >= gameState.currentNumber) {
        setGameState(prev => ({ ...prev, isBlinking: false }));
        return;
      }
      
      setGameState(prev => ({ ...prev, isBlinking: true }));
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, isBlinking: false, blinkCount: prev.blinkCount + 1 }));
        currentBlink++;
        
        if (currentBlink < gameState.currentNumber) {
          setTimeout(blink, 800); // Pauza mezi bliknutími
        }
      }, 400); // Doba bliknutí
    };
    
    blink();
  };

  // NOVÉ FUNKCE PRO VYHODNOCENÍ
  const handleTapCheck = () => {
    const isCorrect = gameState.tapCount === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  const handleSelectCheck = () => {
    const isCorrect = gameState.selectedNumber === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  const handleDotsCheck = () => {
    const clickedCount = gameState.clickedDots.filter(Boolean).length;
    const isCorrect = clickedCount === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  const handleClickCheck = () => {
    const isCorrect = gameState.clickedObjects.length === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  const handleBlinkCheck = () => {
    const isCorrect = gameState.guessedBlinks === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  // Nová funkce pro vyhodnocení úlů
  const handleTallyCheck = () => {
    const isCorrect = gameState.tallyCount === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  // Nová funkce pro vyhodnocení kostek
  const handleDiceCheck = () => {
    const isCorrect = gameState.diceValue === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 500);
  };

  // Render levého kontejneru (zadání)
  const renderChallenge = () => {
    const { currentNumber, challengeType, isBlinking } = gameState;

    const containerContent = () => {
      switch (challengeType) {
        case 'written':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-white text-[120px] md:text-[400px] font-bold leading-none">
                {currentNumber}
              </div>
            </div>
          );
        case 'dots':
          return (
            <div className="relative w-full h-full">
              {renderDots(currentNumber)}
            </div>
          );
        case 'objects':
          return (
            <div className="flex items-center justify-center h-full w-full">
              <div 
                className="relative w-full h-full"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                {renderObjects(currentNumber)}
              </div>
            </div>
          );
        case 'sound':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="mb-8">
                <Music className="w-32 h-32 md:w-48 md:h-48 text-white" />
              </div>
              {gameState.isPlayingSound && (
                <div className="text-white text-xl">
                  Počítej pípnutí...
                </div>
              )}
            </div>
          );
        case 'blink':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              {/* Jen dioda */}
              <div 
                className={`w-32 h-32 md:w-40 md:h-40 rounded-full transition-all duration-300 ${
                  isBlinking 
                    ? 'shadow-[0_0_40px_#00FF94,0_0_80px_#00FF94,0_0_120px_#00FF94]' 
                    : ''
                }`}
                style={{
                  backgroundColor: isBlinking ? '#00FF94' : '#000000'
                }}
              />
            </div>
          );
        default:
          return null;
      }
    };

    const getTitle = () => {
      switch (challengeType) {
        case 'written': return 'Přečti';
        case 'dots': return 'Spočítej';
        case 'objects': return 'Spočítej';
        case 'sound': return 'Poslouchej';
        case 'blink': return 'Počítej bliknutí';
        default: return '';
      }
    };

    return (
      <div className="bg-[#4e5871] h-[320px] w-[300px] md:h-[533px] md:w-[551px] rounded-[29px] border-4 border-[#f6da27] shadow-lg relative">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg md:text-[29px] font-medium">
          {getTitle()}
        </div>
        <div className="absolute inset-8 top-16">
          {containerContent()}
        </div>
        
        {/* RELOAD TLAČÍTKO PRO BLIKÁNÍ A ZVUK - DOLŮ NA STŘED */}
        {(challengeType === 'blink' || challengeType === 'sound') && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={() => {
                if (challengeType === 'blink') {
                  startBlinking();
                } else if (challengeType === 'sound') {
                  playBeep(currentNumber);
                }
              }}
              size="xl"
              className="bg-white text-gray-800 hover:bg-gray-100 text-xl px-8 py-4"
              disabled={challengeType === 'sound' && gameState.isPlayingSound}
            >
              <RotateCcw className="w-8 h-8" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render pravého kontejneru (úkol) - POUŽÍVÁ NASTAVENÍ PRO ROZSAH ČÍSEL
  const renderTask = () => {
    const { taskType, challengeType, tapCount, selectedNumber, currentNumber, clickedDots, guessedBlinks } = gameState;

    const getTitle = () => {
      if (challengeType === 'blink') {
        return 'Kolik to bylo?';
      }
      switch (taskType) {
        case 'tap': return 'Vyťukej počet mezerníkem';
        case 'select': return 'Kolik to je?';
        case 'dots': return 'Označkuj';
        case 'click': return 'Naklikej';
        case 'tally': return 'Zapiš čárkami';
        case 'dice': return 'Ukaž na kostce';
        default: return '';
      }
    };

    const renderTaskContent = () => {
      if (challengeType === 'blink') {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
              {Array.from({ length: gameConfig.MAX_NUMBER - gameConfig.MIN_NUMBER + 1 }, (_, i) => {
                const number = i + gameConfig.MIN_NUMBER;
                return (
                  <button
                    key={number}
                    onClick={() => !gameState.isCompletingTask && setGameState(prev => ({ ...prev, guessedBlinks: number }))}
                    disabled={gameState.isCompletingTask}
                    className={`w-16 h-16 md:w-24 md:h-24 rounded-full text-lg md:text-3xl font-bold transition-all flex items-center justify-center ${ 
                      guessedBlinks === number
                        ? 'bg-[#4a43e8] text-white shadow-lg scale-110'
                        : 'bg-white border-2 border-[#dee4f1] text-[#4e5871] hover:scale-105 shadow-md'
                    } ${gameState.isCompletingTask ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
            {/* Tlačítko pro kontrolu */}
            <Button
              onClick={handleBlinkCheck}
              disabled={guessedBlinks === null || gameState.isCompletingTask}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg"
            >
              Zkontrolovat
            </Button>
          </div>
        );
      }
      
      switch (taskType) {
        case 'tap':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-5 gap-1 md:gap-3 mb-3 md:mb-6">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-xl border-2 md:border-4 ${
                      i < tapCount 
                        ? 'bg-green-500 border-green-500 shadow-lg scale-110' 
                        : 'bg-gray-200 border-gray-400 shadow-sm'
                    }`}
                  >
                    {i < tapCount && (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm md:text-2xl font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Tlačítko Mezerník pro dotykové zařízení */}
              <div className="mb-2 md:mb-4">
                <Button
                  onClick={() => {
                    if (gameState.gamePhase === 'playing' && !gameState.isCompletingTask) {
                      setGameState(prev => ({ ...prev, tapCount: prev.tapCount + 1 }));
                    }
                  }}
                  disabled={gameState.isCompletingTask}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 md:px-8 md:py-4 text-base md:text-xl font-bold rounded-lg md:rounded-xl shadow-lg"
                  size="sm md:lg"
                >
                  MEZERNÍK
                </Button>
              </div>
              

              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleTapCheck}
                disabled={tapCount === 0 || gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg mt-1 md:mt-2"
              >
                Zkontrolovat
              </Button>
            </div>
          );
        case 'select':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
                {Array.from({ length: gameConfig.MAX_NUMBER - gameConfig.MIN_NUMBER + 1 }, (_, i) => {
                  const number = i + gameConfig.MIN_NUMBER;
                  return (
                    <button
                      key={number}
                      onClick={() => !gameState.isCompletingTask && setGameState(prev => ({ ...prev, selectedNumber: number }))}
                      disabled={gameState.isCompletingTask}
                      className={`w-16 h-16 md:w-24 md:h-24 rounded-full text-lg md:text-3xl font-bold transition-all flex items-center justify-center ${ 
                        selectedNumber === number
                          ? 'bg-[#4a43e8] text-white shadow-lg scale-110'
                          : 'bg-white border-2 border-[#dee4f1] text-[#4e5871] hover:scale-105 shadow-md'
                      } ${gameState.isCompletingTask ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleSelectCheck}
                disabled={selectedNumber === null || gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg"
              >
                Zkontrolovat
              </Button>
            </div>
          );
        case 'dots':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-4 gap-1 md:gap-3 mb-3 md:mb-6">
                {Array.from({ length: 16 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => !gameState.isCompletingTask && setGameState(prev => ({
                      ...prev,
                      clickedDots: prev.clickedDots.map((clicked, index) => 
                        index === i ? !clicked : clicked
                      )
                    }))}
                    disabled={gameState.isCompletingTask}
                    className={`w-10 h-10 md:w-18 md:h-18 rounded-full border-0 ${
                      clickedDots[i] 
                        ? 'bg-[#5A0FFD]' 
                        : 'bg-[#FF8158]'
                    } ${gameState.isCompletingTask ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} transition-transform`}
                  />
                ))}
              </div>

              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleDotsCheck}
                disabled={clickedDots.filter(Boolean).length === 0 || gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg mt-2 md:mt-4"
              >
                Zkontrolovat
              </Button>
            </div>
          );
        case 'click':
          return (
            <div className="flex flex-col h-full">
              {/* Klikací oblast rozšířená na celý kontejner */}
              <div 
                className="relative flex-1 w-full bg-white rounded-xl cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={(e) => {
                  if (!gameState.isCompletingTask) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    setGameState(prev => ({
                      ...prev,
                      clickedObjects: [...prev.clickedObjects, {
                        x,
                        y,
                        objectType: gameState.clickObjectType
                      }]
                    }));
                  }
                }}
              >
                {/* Zobrazené objekty k naklikání s SVG - o 80% větší */}
                {gameState.clickedObjects.map((obj, index) => (
                  <div
                    key={index}
                    className="absolute select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      zIndex: index + 1
                    }}
                  >
                    <ImageWithFallback 
                      src={obj.objectType.svgUrl} 
                      alt={obj.objectType.name} 
                      className="w-16 h-16 md:w-52 md:h-52 object-contain"
                    />
                  </div>
                ))}
              </div>
              

              
              {/* Tlačítka pro reset a kontrolu */}
              <div className="flex gap-2 md:gap-4 justify-center mt-2 md:mt-4">
                <Button
                  onClick={() => setGameState(prev => ({ ...prev, clickedObjects: [] }))}
                  disabled={gameState.isCompletingTask || gameState.clickedObjects.length === 0}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 md:px-6 md:py-2 text-sm md:text-lg"
                >
                  Vymazat vše
                </Button>
                <Button
                  onClick={handleClickCheck}
                  disabled={gameState.clickedObjects.length === 0 || gameState.isCompletingTask}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg"
                >
                  Zkontrolovat
                </Button>
              </div>
            </div>
          );
        case 'tally':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              {/* Úly - vizuální čárky - TUŽKOVÉ A UŽŠÍ ROZLOŽENÍ */}
              <div className="mb-8">
                {gameState.tallyCount <= 10 ? (
                  // Pro 1-10: klasické úly v jedné řadě, max 10 - DYNAMICKÉ MEZERY PODLE POČTU
                  <div className={`flex justify-center ${
                    gameState.tallyCount <= 2 ? 'gap-8 md:gap-24' : 
                    gameState.tallyCount <= 4 ? 'gap-6 md:gap-16' : 
                    gameState.tallyCount <= 6 ? 'gap-4 md:gap-12' : 
                    gameState.tallyCount <= 8 ? 'gap-3 md:gap-8' : 'gap-2 md:gap-6'
                  }`}>
                    {Array.from({ length: gameState.tallyCount }, (_, i) => (
                      <div
                        key={i}
                        className="w-3 h-32 md:w-6 md:h-[252px] bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-sm shadow-md opacity-90"
                        style={{
                          background: `linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 100%)`,
                          filter: 'blur(0.3px)'
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  // Pro 11+: sloučené úly (|||) s jednotlivými, více řad - VĚTŠÍ MEZERY
                  <div className="flex flex-col items-center gap-3">
                    {/* Skupiny po 5 v řadách po max 10 */}
                    {Math.floor(gameState.tallyCount / 5) > 0 && (
                      <div className="flex flex-wrap justify-center gap-8 max-w-[600px]">
                        {Array.from({ length: Math.floor(gameState.tallyCount / 5) }, (_, i) => (
                          <div key={i} className="relative">
                            {/* 4 vertikální čárky */}
                            <div className="flex gap-2">
                              {Array.from({ length: 4 }, (_, j) => (
                                <div
                                  key={j}
                                  className="w-2 h-32 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-sm opacity-90"
                                  style={{
                                    background: `linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 100%)`,
                                    filter: 'blur(0.3px)',
                                    transform: `rotate(${Math.random() * 4 - 2}deg)`
                                  }}
                                />
                              ))}
                            </div>
                            {/* Diagonální čárka přes ně */}
                            <div 
                              className="absolute top-0 left-0 w-full h-32 flex items-center justify-center"
                            >
                              <div 
                                className="w-12 h-1 bg-gradient-to-r from-[#4a4a4a] to-[#2a2a2a] rounded-sm transform rotate-[25deg] shadow-md opacity-90"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Zbývající jednotlivé čárky - také s dynamickými mezerami */}
                    {gameState.tallyCount % 5 > 0 && (
                      <div className={`flex justify-center ${
                        (gameState.tallyCount % 5) <= 2 ? 'gap-16' : 
                        (gameState.tallyCount % 5) <= 3 ? 'gap-12' : 'gap-8'
                      }`}>
                        {Array.from({ length: gameState.tallyCount % 5 }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-32 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-sm shadow-md opacity-90"
                            style={{
                              background: `linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 100%)`,
                              filter: 'blur(0.3px)',
                              transform: `rotate(${Math.random() * 4 - 2}deg)`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ovládací šipky - ZPĚT NA STŘED KONTEJNERU */}
              <div className="flex items-center gap-8">
                <button
                  onClick={() => {
                    if (gameState.gamePhase === 'playing' && !gameState.isCompletingTask && gameState.tallyCount > 0) {
                      setGameState(prev => ({ ...prev, tallyCount: prev.tallyCount - 1 }));
                    }
                  }}
                  disabled={gameState.isCompletingTask || gameState.tallyCount === 0}
                  className="w-20 h-20 md:w-24 md:h-24 bg-[#6b7280] hover:bg-[#4b5563] text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold transition-all"
                >
                  <ChevronDown className="w-8 h-8" />
                </button>
                
                <button
                  onClick={() => {
                    if (gameState.gamePhase === 'playing' && !gameState.isCompletingTask && gameState.tallyCount < 20) {
                      setGameState(prev => ({ ...prev, tallyCount: prev.tallyCount + 1 }));
                    }
                  }}
                  disabled={gameState.isCompletingTask || gameState.tallyCount >= 20}
                  className="w-20 h-20 md:w-24 md:h-24 bg-[#6b7280] hover:bg-[#4b5563] text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold transition-all"
                >
                  <ChevronUp className="w-8 h-8" />
                </button>
              </div>

              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleTallyCheck}
                disabled={gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg mt-3 md:mt-6"
              >
                Zkontrolovat
              </Button>
            </div>
          );

        case 'dice':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              {/* KOSTKA - responsivní velikost */}
              <div className="mb-4 md:mb-8" style={{ marginTop: '20px', marginTop: 'md:70px' }}>
                <div 
                  className="w-32 h-32 md:w-72 md:h-72 bg-purple-600 rounded-lg md:rounded-xl shadow-xl border-2 md:border-4 border-purple-700 flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(145deg, #9333ea, #7c3aed)',
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  {gameState.diceValue === 0 ? (
                    <div className="text-white text-lg md:text-4xl opacity-50">?</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-5 p-2 md:p-8">
                      {/* Tečky na kostce - O 135% VĚTŠÍ A ROZŠÍŘENÉ DO DEVÍTKY */}
                      {(() => {
                        const patterns = {
                          1: [4],
                          2: [0, 8],
                          3: [0, 4, 8],
                          4: [0, 2, 6, 8],
                          5: [0, 2, 4, 6, 8],
                          6: [0, 1, 2, 6, 7, 8],
                          7: [0, 1, 2, 4, 6, 7, 8],
                          8: [0, 1, 2, 3, 5, 6, 7, 8],
                          9: [0, 1, 2, 3, 4, 5, 6, 7, 8]
                        };
                        
                        const pattern = patterns[gameState.diceValue as keyof typeof patterns] || [];
                        
                        return Array.from({ length: 9 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 md:w-11 md:h-11 rounded-full ${
                              pattern.includes(i) 
                                ? 'bg-white shadow-sm' 
                                : 'transparent'
                            }`}
                          />
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Ovládací šipky - responsivní */}
              <div className="flex items-center gap-4 md:gap-8" style={{ marginTop: '5px' }}>
                <button
                  onClick={() => {
                    if (gameState.gamePhase === 'playing' && !gameState.isCompletingTask && gameState.diceValue > 0) {
                      setGameState(prev => ({ ...prev, diceValue: prev.diceValue - 1 }));
                    }
                  }}
                  disabled={gameState.isCompletingTask || gameState.diceValue === 0}
                  className="w-12 h-12 md:w-24 md:h-24 bg-[#6b7280] hover:bg-[#4b5563] text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold transition-all"
                >
                  <ChevronDown className="w-4 h-4 md:w-8 md:h-8" />
                </button>
                
                <button
                  onClick={() => {
                    if (gameState.gamePhase === 'playing' && !gameState.isCompletingTask && gameState.diceValue < 9) {
                      setGameState(prev => ({ ...prev, diceValue: prev.diceValue + 1 }));
                    }
                  }}
                  disabled={gameState.isCompletingTask || gameState.diceValue >= 9}
                  className="w-12 h-12 md:w-24 md:h-24 bg-[#6b7280] hover:bg-[#4b5563] text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold transition-all"
                >
                  <ChevronUp className="w-4 h-4 md:w-8 md:h-8" />
                </button>
              </div>

              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleDiceCheck}
                disabled={gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg"
                style={{ marginTop: '9px' }}
              >
                Zkontrolovat
              </Button>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="bg-white h-[320px] w-[300px] md:h-[533px] md:w-[551px] rounded-[29px] border-4 border-[#f6da27] shadow-lg relative">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-[#4e5871] text-lg md:text-[29px] font-medium">
          {getTitle()}
        </div>
        <div className="absolute inset-8 top-16">
          {renderTaskContent()}
        </div>
      </div>
    );
  };

  // Hlavní render s novou hlavičkou
  return (
    <div className="min-h-screen bg-[#F5E6D0] flex flex-col">
      {/* Nová hlavička */}
      <NumberRecognitionHeader
        round={gameState.round}
        totalRounds={gameConfig.TOTAL_ROUNDS}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameConfig.MAX_LIVES}
        timeLeft={gameState.timeLeft}
        totalTime={gameConfig.TIME_LIMIT}
      />

      {/* Herní oblast */}
      <div className="flex-1 flex items-center justify-center py-4">
        {gameState.gamePhase === 'countdown' ? (
          <CountdownOverlay 
            isVisible={true}
            onComplete={handleCountdownComplete}
          />
        ) : gameState.showResult ? (
          <GameResultScreen
            isSuccess={gameStats.correctAnswers >= Math.ceil(gameConfig.TOTAL_ROUNDS * 0.6)}
            score={gameStats.finalScore}
            totalQuestions={gameStats.totalRounds}
            correctAnswers={gameStats.correctAnswers}
            timeouts={gameStats.timeouts}
            onRestart={startNewGame}
            gameTitle="Poznej čísla"
            showStreakBonus={false}
            streakCount={0}
          />
        ) : (
          <>
            {/* Herní kontejnery - responsivní layout */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-9 justify-center items-center w-full px-4">
              {/* Levý kontejner (zadání) */}
              {renderChallenge()}
              
              {/* Pravý kontejner (úkol) */}
              {renderTask()}
            </div>

            {/* Overlay pro zobrazení správné/špatné odpovědi */}
            <AnimatePresence>
              {gameState.showCorrectAnswer && (
                <CorrectAnswerOverlay
                  isSuccess={gameState.lastAnswerWasCorrect}
                  successText="SPRÁVNĚ!"
                  failureText="ŠPATNĚ!"
                  autoHideDuration={1500}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}