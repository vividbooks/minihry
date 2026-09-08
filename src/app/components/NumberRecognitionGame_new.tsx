// Tento soubor již není potřeba
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCcw, Music } from 'lucide-react';
import { Button } from './ui/button';
import { CountdownOverlay } from './CountdownOverlay';

// Typy objektů pro zobrazení množství
const OBJECT_TYPES = [
  { name: 'srdce', emoji: '❤️', color: '#dc2626' },
  { name: 'hvězda', emoji: '⭐', color: '#fbbf24' },
  { name: 'kruh', emoji: '🔴', color: '#f97316' },
  { name: 'květina', emoji: '🌸', color: '#ec4899' },
  { name: 'diamant', emoji: '💎', color: '#06b6d4' },
  { name: 'slunce', emoji: '☀️', color: '#eab308' },
  { name: 'motýl', emoji: '🦋', color: '#8b5cf6' },
  { name: 'jetel', emoji: '🍀', color: '#22c55e' },
  { name: 'balónek', emoji: '🎈', color: '#f59e0b' }
];

// Výchozí konstanty hry (pro zpětnou kompatibilitu)
const DEFAULT_TOTAL_ROUNDS = 10;
const DEFAULT_TIME_LIMIT = 30; // sekund na kolo
const DEFAULT_MAX_LIVES = 3;
const DEFAULT_MIN_NUMBER = 1;
const DEFAULT_MAX_NUMBER = 9;
const DEFAULT_CHALLENGE_TYPES = ['written', 'dots', 'objects', 'sound', 'blink'];
const DEFAULT_TASK_TYPES = ['tap', 'select', 'dots', 'click'];

// Typy zadání
type ChallengeType = 'written' | 'dots' | 'objects' | 'sound' | 'blink';
// Typy úkolů  
type TaskType = 'tap' | 'select' | 'dots' | 'click';

interface GameSettings {
  minNumber?: number;
  maxNumber?: number;
  totalRounds?: number;
  timeLimit?: number;
  maxLives?: number;
  challengeTypes?: ChallengeType[];
  taskTypes?: TaskType[];
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
  clickedObjects: Array<{x: number, y: number, emoji: string}>;
  clickObjectType: typeof OBJECT_TYPES[0];
}

interface GameStats {
  totalRounds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeouts: number;
  finalScore: number;
}

export function NumberRecognitionGame({ settings = {} }: NumberRecognitionGameProps) {
  // Aplikování nastavení s fallback na výchozí hodnoty
  const gameConfig = {
    TOTAL_ROUNDS: settings.totalRounds ?? DEFAULT_TOTAL_ROUNDS,
    TIME_LIMIT: settings.timeLimit ?? DEFAULT_TIME_LIMIT,
    MAX_LIVES: settings.maxLives ?? DEFAULT_MAX_LIVES,
    MIN_NUMBER: settings.minNumber ?? DEFAULT_MIN_NUMBER,
    MAX_NUMBER: settings.maxNumber ?? DEFAULT_MAX_NUMBER,
    CHALLENGE_TYPES: settings.challengeTypes ?? DEFAULT_CHALLENGE_TYPES,
    TASK_TYPES: settings.taskTypes ?? DEFAULT_TASK_TYPES
  };

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
    isCompletingTask: false,
    clickedDots: Array(16).fill(false),
    blinkCount: 0,
    isBlinking: false,
    guessedBlinks: null,
    clickedObjects: [],
    clickObjectType: OBJECT_TYPES[0]
  });

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalRounds: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeouts: 0,
    finalScore: 0
  });

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

  // Generování nového kola - POUŽÍVÁ NASTAVENÍ
  const generateRound = useCallback(() => {
    const number = Math.floor(Math.random() * (gameConfig.MAX_NUMBER - gameConfig.MIN_NUMBER + 1)) + gameConfig.MIN_NUMBER;
    
    const challengeType = gameConfig.CHALLENGE_TYPES[Math.floor(Math.random() * gameConfig.CHALLENGE_TYPES.length)];
    const taskType = gameConfig.TASK_TYPES[Math.floor(Math.random() * gameConfig.TASK_TYPES.length)];
    
    // Fixní typ objektu pro celé kolo
    const objectType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    const clickObjectType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];

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
      clickedObjects: []
    }));
  }, [gameConfig]);

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
      clickedObjects: []
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
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'playing', 
      isGameActive: true 
    }));
    generateRound();
  }, [generateRound]);

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

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setGameState(prev => ({ ...prev, gamePhase: 'feedback' }));

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

        if (newLives === 0 || newRound > gameConfig.TOTAL_ROUNDS) {
          setGameStats(prevStats => ({ ...prevStats, finalScore: newScore }));
          return {
            ...prev,
            score: newScore,
            lives: newLives,
            showResult: true,
            gamePhase: 'ended',
            isGameActive: false
          };
        }

        return {
          ...prev,
          score: newScore,
          lives: newLives,
          round: newRound,
          gamePhase: 'playing'
        };
      });

      if (gameState.round < gameConfig.TOTAL_ROUNDS && gameState.lives > 0) {
        generateRound();
      }
      setFeedback(null);
    }, 1500);
  }, [gameState.gamePhase, gameState.timeLeft, gameState.round, gameState.lives, generateRound, gameConfig]);

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
        className="absolute w-12 h-12 md:w-16 md:h-16 bg-white rounded-full"
        style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)' }}
      />
    ));
  };

  // Render objektů
  const renderObjects = (number: number) => {
    const objectType = gameState.currentObjectType;
    const objects = [];
    
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
          {objectType.emoji}
        </div>
      );
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
    setTimeout(() => handleAnswer(isCorrect), 1000);
  };

  const handleSelectCheck = () => {
    const isCorrect = gameState.selectedNumber === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 1000);
  };

  const handleDotsCheck = () => {
    const clickedCount = gameState.clickedDots.filter(Boolean).length;
    const isCorrect = clickedCount === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 1000);
  };

  const handleClickCheck = () => {
    const isCorrect = gameState.clickedObjects.length === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 1000);
  };

  const handleBlinkCheck = () => {
    const isCorrect = gameState.guessedBlinks === gameState.currentNumber;
    setGameState(prev => ({ ...prev, isCompletingTask: true }));
    setTimeout(() => handleAnswer(isCorrect), 1000);
  };

  // Render levého kontejneru (zadání)
  const renderChallenge = () => {
    const { currentNumber, challengeType, isBlinking } = gameState;

    const containerContent = () => {
      switch (challengeType) {
        case 'written':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-white text-[300px] md:text-[400px] font-bold leading-none">
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
            <div className="relative w-full h-full">
              {renderObjects(currentNumber)}
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
      <div className="bg-[#4e5871] h-[400px] w-[350px] md:h-[533px] md:w-[551px] rounded-[29px] border-4 border-[#f6da27] shadow-lg relative">
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
        case 'click': return 'Naklikej na oblast';
        default: return '';
      }
    };

    const renderTaskContent = () => {
      if (challengeType === 'blink') {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {Array.from({ length: Math.min(9, gameConfig.MAX_NUMBER) }, (_, i) => {
                const number = i + gameConfig.MIN_NUMBER;
                if (number > gameConfig.MAX_NUMBER) return null;
                return (
                  <button
                    key={number}
                    onClick={() => !gameState.isCompletingTask && setGameState(prev => ({ ...prev, guessedBlinks: number }))}
                    disabled={gameState.isCompletingTask}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full text-2xl md:text-3xl font-bold transition-all ${
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
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
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
              <div className="grid grid-cols-5 gap-3 mb-8">
                {Array.from({ length: Math.max(10, gameConfig.MAX_NUMBER + 2) }, (_, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-4 ${
                      i < tapCount 
                        ? 'bg-green-500 border-green-500 shadow-lg scale-110' 
                        : 'bg-gray-200 border-gray-400 shadow-sm'
                    }`}
                  >
                    {i < tapCount && (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {tapCount > currentNumber && (
                <div className="text-red-500 mt-4 text-xl font-bold bg-red-100 px-4 py-2 rounded-lg">
                  ❌ Příliš mnoho!
                </div>
              )}
              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleTapCheck}
                disabled={tapCount === 0 || gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg mt-4"
              >
                Zkontrolovat
              </Button>
            </div>
          );
        case 'select':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {Array.from({ length: Math.min(9, gameConfig.MAX_NUMBER) }, (_, i) => {
                  const number = i + gameConfig.MIN_NUMBER;
                  if (number > gameConfig.MAX_NUMBER) return null;
                  return (
                    <button
                      key={number}
                      onClick={() => !gameState.isCompletingTask && setGameState(prev => ({ ...prev, selectedNumber: number }))}
                      disabled={gameState.isCompletingTask}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-full text-2xl md:text-3xl font-bold transition-all ${
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
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
              >
                Zkontrolovat
              </Button>
            </div>
          );
        case 'dots':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-4 gap-3 mb-6">
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
                    className={`w-16 h-16 md:w-18 md:h-18 rounded-full border-0 ${
                      clickedDots[i] 
                        ? 'bg-[#5A0FFD]' 
                        : 'bg-[#FF8158]'
                    } ${gameState.isCompletingTask ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} transition-transform`}
                  />
                ))}
              </div>
              {clickedDots.filter(Boolean).length > currentNumber && (
                <div className="text-red-500 mt-4 text-xl font-bold bg-red-100 px-4 py-2 rounded-lg">
                  ❌ Příliš mnoho!
                </div>
              )}
              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleDotsCheck}
                disabled={clickedDots.filter(Boolean).length === 0 || gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg mt-4"
              >
                Zkontrolovat
              </Button>
            </div>
          );
        case 'click':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div 
                className="relative w-full h-3/4 bg-white rounded-lg cursor-crosshair overflow-hidden mb-4"
                onClick={(e) => {
                  if (gameState.isCompletingTask) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  
                  // Ujistíme se, že objekt není moc blízko k okrajům
                  if (x < 10 || x > 90 || y < 10 || y > 90) return;
                  
                  const newObject = {
                    x,
                    y, 
                    emoji: gameState.clickObjectType.emoji
                  };
                  
                  setGameState(prev => ({
                    ...prev,
                    clickedObjects: [...prev.clickedObjects, newObject]
                  }));
                }}
              >
                {/* Renderování naklikaných objektů */}
                {gameState.clickedObjects.map((obj, index) => (
                  <div
                    key={index}
                    className="absolute text-6xl md:text-8xl pointer-events-none select-none animate-pulse"
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      transform: 'translate(-50%, -50%)',
                      animationDuration: '1s',
                      animationFillMode: 'both',
                      animationDelay: `${index * 0.1}s`,
                      animationIterationCount: '3'
                    }}
                  >
                    {obj.emoji}
                  </div>
                ))}
              </div>
              {/* Tlačítko pro kontrolu */}
              <Button
                onClick={handleClickCheck}
                disabled={gameState.clickedObjects.length === 0 || gameState.isCompletingTask}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
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
      <div className="bg-white h-[400px] w-[350px] md:h-[533px] md:w-[551px] rounded-[29px] border-4 border-[#f6da27] shadow-lg relative">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-black text-lg md:text-[29px] font-medium">
          {getTitle()}
        </div>
        <div className="absolute inset-8 top-16">
          {renderTaskContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F5F1E8] min-h-screen w-full relative">
      {/* Countdown overlay */}
      <CountdownOverlay
        isVisible={gameState.gamePhase === 'countdown'}
        onComplete={handleCountdownComplete}
      />
      
      {/* Hráčův status - životy, kolo, čas */}
      <div className="fixed top-4 left-4 bg-white p-4 rounded-xl shadow-lg z-10">
        <div className="flex items-center gap-4">
          {/* Životy */}
          <div className="flex gap-1">
            {Array.from({ length: gameConfig.MAX_LIVES }).map((_, index) => (
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
          
          {/* Kolo */}
          <div className="text-sm font-medium text-gray-700">
            Kolo: {gameState.round}/{gameConfig.TOTAL_ROUNDS}
          </div>
          
          {/* Čas */}
          {gameState.gamePhase === 'playing' && (
            <div className="text-sm font-medium text-blue-600">
              Čas: {gameState.timeLeft}s
            </div>
          )}
        </div>
      </div>
      
      {/* Restart tlačítko */}
      <div className="fixed top-4 right-4 z-10">
        <Button onClick={startNewGame} className="bg-blue-500 hover:bg-blue-600 text-white">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      </div>
      
      {/* Herní kontejnery */}
      {gameState.gamePhase === 'playing' && (
        <div className="flex items-center justify-center min-h-screen gap-8 p-8">
          {/* Levý kontejner - zadání */}
          {renderChallenge()}
          
          {/* Pravý kontejner - úkol */}
          {renderTask()}
        </div>
      )}

      {/* OVERLAY PRO ČEKÁNÍ A STATISTIKY - KOMPLETNÍ PŘEPIS */}
      <AnimatePresence>
        {gameState.showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 text-center"
            >
              <div className="text-6xl mb-4">{gameStats.correctAnswers >= Math.ceil(gameConfig.TOTAL_ROUNDS * 0.6) ? '🎉' : '😊'}</div>
              <h2 className="text-3xl text-black mb-6">
                {gameStats.correctAnswers >= Math.ceil(gameConfig.TOTAL_ROUNDS * 0.6) ? 'Skvělá práce!' : 'Konec hry!'}
              </h2>
              <div className="space-y-3 mb-8">
                <div className="text-xl text-black">Skóre: <span className="text-green-600">{gameStats.finalScore}/{gameStats.totalRounds}</span></div>
                <div className="text-lg text-gray-600">
                  Správných odpovědí: {gameStats.correctAnswers}
                </div>
                <div className="text-lg text-gray-600">
                  Chybných odpovědí: {gameStats.incorrectAnswers}
                </div>
                {gameStats.timeouts > 0 && (
                  <div className="text-lg text-orange-500">
                    Časové limity: {gameStats.timeouts}
                  </div>
                )}
              </div>
              <Button onClick={startNewGame} size="lg" className="text-xl px-8 py-3">
                Hrát znovu
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK OVERLAY - ÚSPĚCH/CHYBA */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 px-8 py-6 rounded-2xl ${
              feedback === 'correct' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}
          >
            <div className="text-4xl md:text-6xl font-bold text-center">
              {feedback === 'correct' ? '✅ Správně!' : '❌ Špatně!'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}