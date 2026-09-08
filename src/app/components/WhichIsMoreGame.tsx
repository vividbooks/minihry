import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Play, Pause, RotateCcw, Home, Settings2, Heart, Timer, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Importy pro zvukové efekty
const correctSound = new Audio('data:audio/wav;base64,UklGRhwCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4BAAABAgcKBwgDBggGAwQCAwEBCAoHBwYFBQYGBQQEAwQCAgICAwMGCAcHBwcGBwcGBwgHBwgHBwgICAcIBwgICAkICAgICAkJCgkJCQkKCQkJCQkKCgoKCgoKCwsLCgsMCwwLCwsLDAwMDAwNDQ4ODg0ODg8PDw8PEA8PERAQEBAQERAQERARERESERESExMSEhMTFBQTExMUFBQVFRQUFRUVFhUVFRYWFxcWFhYXFxcXGBgXFxgYGBkYGBgYGRkZGhkaGhkaGhsbGhkaGxsbGxwcGxscHBwcHBwdHR0dHh0dHR4eHh8eHh4fHx8fIB8fHyAgICAhIB8gICEiISEhISEiIyIiIyMjIyMjJCQjIyQkJCUlJCQkJSUlJSYlJSUmJiYmJicmJiYnJycnJycnKCgpEjcAAAAASUVORKgAAA==');
const incorrectSound = new Audio('data:audio/wav;base64,UklGRrwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZgAAAC4u7e7u7m5uru5ubq8ubu8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8u7u8');

interface GameConfig {
  gameMode: 'whichIsMore' | 'clickMore' | 'clickLess';
  objectRange: [number, number];
  totalRounds: number;
  timeBasedGame: boolean;
  timeLimit: number;
  maxLives: number;
  maxDifference: number;
  enableAudio: boolean;
  showDetailedStats: boolean;
  autoStartRounds: boolean;
  containerWidth: number;
  containerHeight: number;
  backgroundColor: string;
}

interface Container {
  id: number;
  count: number;
  isCorrect: boolean;
  isSelected: boolean;
  objects: Array<{
    id: number;
    emoji: string;
    x: number;
    y: number;
    rotation: number;
  }>;
}

interface GameStats {
  round: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  lives: number;
  timeRemaining: number;
}

interface WhichIsMoreGameProps {
  config: GameConfig;
  onBackToAdmin?: () => void;
  showBackButton?: boolean;
}

const EMOJI_OBJECTS = ['🍎', '🍊', '🍌', '🍓', '🥝', '🍇', '🥨', '🧄', '🥕', '🌶️', '🌽', '🥒', '🥦', '🍄', '🧅'];

export function WhichIsMoreGame({ config, onBackToAdmin, showBackButton = false }: WhichIsMoreGameProps) {
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'paused' | 'gameOver' | 'results'>('menu');
  const [containers, setContainers] = useState<Container[]>([]);
  const [stats, setStats] = useState<GameStats>({
    round: 1,
    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    lives: config.maxLives,
    timeRemaining: config.timeLimit
  });
  const [countdown, setCountdown] = useState(3);
  const [gameMessage, setGameMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Generování náhodných objektů v kontejneru
  const generateObjects = useCallback((count: number, containerWidth: number, containerHeight: number) => {
    const objects = [];
    const emoji = EMOJI_OBJECTS[Math.floor(Math.random() * EMOJI_OBJECTS.length)];
    
    for (let i = 0; i < count; i++) {
      objects.push({
        id: i,
        emoji: emoji,
        x: Math.random() * (containerWidth - 40) + 20,
        y: Math.random() * (containerHeight - 40) + 20,
        rotation: Math.random() * 360
      });
    }
    return objects;
  }, []);

  // Generování nového kola
  const generateNewRound = useCallback(() => {
    const containerCount = config.gameMode === 'whichIsMore' ? 2 : Math.floor(Math.random() * 3) + 3; // 2 pro "Čeho je více?", 3-5 pro ostatní módy
    const newContainers: Container[] = [];
    
    const [minObjects, maxObjects] = config.objectRange;
    
    for (let i = 0; i < containerCount; i++) {
      const count = Math.floor(Math.random() * (maxObjects - minObjects + 1)) + minObjects;
      newContainers.push({
        id: i,
        count: count,
        isCorrect: false,
        isSelected: false,
        objects: generateObjects(count, config.containerWidth, config.containerHeight)
      });
    }

    // Určení správných odpovědí podle herního módu
    if (config.gameMode === 'whichIsMore') {
      const maxCount = Math.max(...newContainers.map(c => c.count));
      newContainers.forEach(container => {
        if (container.count === maxCount) {
          container.isCorrect = true;
        }
      });
    } else if (config.gameMode === 'clickMore') {
      const maxCount = Math.max(...newContainers.map(c => c.count));
      newContainers.forEach(container => {
        if (container.count === maxCount) {
          container.isCorrect = true;
        }
      });
    } else if (config.gameMode === 'clickLess') {
      const minCount = Math.min(...newContainers.map(c => c.count));
      newContainers.forEach(container => {
        if (container.count === minCount) {
          container.isCorrect = true;
        }
      });
    }

    setContainers(newContainers);
    
    if (config.timeBasedGame) {
      setStats(prev => ({ ...prev, timeRemaining: config.timeLimit }));
      startTimer();
    }
  }, [config, generateObjects]);

  // Spuštění časovače
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setStats(prev => {
        if (prev.timeRemaining <= 1) {
          // Čas vypršel
          handleTimeout();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, []);

  // Zastavení časovače
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Vypršení času
  const handleTimeout = useCallback(() => {
    stopTimer();
    const newLives = stats.lives - 1;
    
    if (config.enableAudio) {
      incorrectSound.play().catch(() => {});
    }
    
    setGameMessage('Čas vypršel!');
    setStats(prev => ({ 
      ...prev, 
      lives: newLives,
      incorrectAnswers: prev.incorrectAnswers + 1
    }));

    if (newLives <= 0) {
      setTimeout(() => setGameState('gameOver'), 1000);
    } else {
      setTimeout(() => {
        setGameMessage('');
        if (config.autoStartRounds) {
          nextRound();
        }
      }, 1500);
    }
  }, [stats.lives, config, stopTimer]);

  // Kliknutí na kontejner
  const handleContainerClick = useCallback((containerId: number) => {
    if (gameState !== 'playing') return;

    setContainers(prev => prev.map(container => {
      if (container.id === containerId) {
        return { ...container, isSelected: !container.isSelected };
      }
      return container;
    }));

    // Pro mód "Čeho je více?" se ihned vyhodnotí
    if (config.gameMode === 'whichIsMore') {
      const clickedContainer = containers.find(c => c.id === containerId);
      if (clickedContainer) {
        evaluateAnswer([containerId]);
      }
    }
  }, [gameState, containers, config.gameMode]);

  // Vyhodnocení odpovědi
  const evaluateAnswer = useCallback((selectedIds: number[]) => {
    stopTimer();
    
    const correctContainers = containers.filter(c => c.isCorrect);
    const selectedContainers = containers.filter(c => selectedIds.includes(c.id));
    
    const isCorrect = selectedContainers.length === correctContainers.length &&
                     selectedContainers.every(sc => correctContainers.some(cc => cc.id === sc.id));

    if (isCorrect) {
      if (config.enableAudio) {
        correctSound.play().catch(() => {});
      }
      
      setGameMessage('SPRÁVNĚ! 🎉');
      setStats(prev => ({ 
        ...prev, 
        score: prev.score + 10,
        correctAnswers: prev.correctAnswers + 1
      }));
      
      setTimeout(() => {
        setGameMessage('');
        nextRound();
      }, 1500);
      
    } else {
      if (config.enableAudio) {
        incorrectSound.play().catch(() => {});
      }
      
      const newLives = stats.lives - 1;
      setGameMessage('Špatně! 😞');
      setStats(prev => ({ 
        ...prev, 
        lives: newLives,
        incorrectAnswers: prev.incorrectAnswers + 1
      }));

      if (newLives <= 0) {
        setTimeout(() => setGameState('gameOver'), 1000);
      } else {
        setTimeout(() => {
          setGameMessage('');
          if (config.autoStartRounds) {
            nextRound();
          }
        }, 1500);
      }
    }
  }, [containers, stats.lives, config, stopTimer]);

  // Potvrzení výběru pro módy s více kontejnery
  const handleConfirmSelection = useCallback(() => {
    const selectedIds = containers.filter(c => c.isSelected).map(c => c.id);
    if (selectedIds.length > 0) {
      evaluateAnswer(selectedIds);
    }
  }, [containers, evaluateAnswer]);

  // Přechod na další kolo
  const nextRound = useCallback(() => {
    if (stats.round >= config.totalRounds) {
      setGameState('results');
      return;
    }

    setStats(prev => ({ ...prev, round: prev.round + 1 }));
    generateNewRound();
  }, [stats.round, config.totalRounds, generateNewRound]);

  // Spuštění hry
  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          generateNewRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownRef.current = countdownInterval;
  }, [generateNewRound]);

  // Restart hry
  const restartGame = useCallback(() => {
    stopTimer();
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setStats({
      round: 1,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      lives: config.maxLives,
      timeRemaining: config.timeLimit
    });
    setContainers([]);
    setGameMessage('');
    setGameState('menu');
  }, [config, stopTimer]);

  // Pauza/pokračování
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      stopTimer();
    } else if (gameState === 'paused') {
      setGameState('playing');
      if (config.timeBasedGame) {
        startTimer();
      }
    }
  }, [gameState, config.timeBasedGame, stopTimer, startTimer]);

  // Cleanup při unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [stopTimer]);

  // Získání instrukcí pro aktuální herní mód
  const getInstructions = () => {
    switch (config.gameMode) {
      case 'whichIsMore':
        return 'Klikni na kontejner, ve kterém je VÍCE objektů!';
      case 'clickMore':
        return 'Označ všechny kontejnery, ve kterých je NEJVÍCE objektů!';
      case 'clickLess':
        return 'Označ všechny kontejnery, ve kterých je NEJMÉNĚ objektů!';
      default:
        return '';
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundColor: config.backgroundColor }}
    >
      {/* Hlavní menu */}
      {gameState === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {showBackButton && onBackToAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToAdmin}
              className="absolute top-4 left-4 bg-white/80 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět do administrace
            </Button>
          )}
          
          <Card className="w-full max-w-md bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">🔢</h1>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Čeho je více?</h1>
                  <p className="text-gray-600">{getInstructions()}</p>
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Začít hrát
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Nastavení
                  </Button>
                </div>
                
                {showSettings && (
                  <div className="text-left space-y-2 p-4 bg-gray-100 rounded-lg text-sm">
                    <div><strong>Herní mód:</strong> {config.gameMode === 'whichIsMore' ? 'Čeho je více?' : config.gameMode === 'clickMore' ? 'Naklikej více' : 'Naklikej méně'}</div>
                    <div><strong>Počet kol:</strong> {config.totalRounds}</div>
                    <div><strong>Rozsah objektů:</strong> {config.objectRange[0]}-{config.objectRange[1]}</div>
                    <div><strong>Časový limit:</strong> {config.timeBasedGame ? `${config.timeLimit}s` : 'Vypnutý'}</div>
                    <div><strong>Počet životů:</strong> {config.maxLives}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Odpočítávání */}
      {gameState === 'countdown' && (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            key={countdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-8xl font-bold text-white"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Hra */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="p-4">
          {/* Header s informacemi */}
          <div className="flex justify-between items-center mb-4 bg-white/90 backdrop-blur rounded-lg p-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-red-600">
                <Heart className="w-5 h-5 mr-1" />
                <span className="font-bold">{stats.lives}</span>
              </div>
              
              {config.timeBasedGame && (
                <div className="flex items-center text-blue-600">
                  <Timer className="w-5 h-5 mr-1" />
                  <span className="font-bold">{stats.timeRemaining}s</span>
                </div>
              )}
              
              <div className="flex items-center text-green-600">
                <Trophy className="w-5 h-5 mr-1" />
                <span className="font-bold">{stats.score}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Kolo {stats.round}/{config.totalRounds}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
              >
                {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={restartGame}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Instrukce */}
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur rounded-lg p-3">
              {getInstructions()}
            </p>
          </div>

          {/* Kontejnery */}
          <div className={`grid gap-4 mb-6 ${
            containers.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
            containers.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 
            'grid-cols-2 md:grid-cols-4'
          } max-w-6xl mx-auto`}>
            {containers.map((container) => (
              <motion.div
                key={container.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  container.isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                style={{ 
                  width: config.containerWidth,
                  height: config.containerHeight 
                }}
                onClick={() => handleContainerClick(container.id)}
              >
                {/* Objekty v kontejneru */}
                {container.objects.map((obj) => (
                  <motion.div
                    key={obj.id}
                    className="absolute text-2xl select-none pointer-events-none"
                    style={{
                      left: obj.x,
                      top: obj.y,
                      transform: `rotate(${obj.rotation}deg)`
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: obj.id * 0.05 }}
                  >
                    {obj.emoji}
                  </motion.div>
                ))}
                
                {/* Počítadlo objektů */}
                <div className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {container.count}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Potvrzovací tlačítko pro módy s více kontejnery */}
          {config.gameMode !== 'whichIsMore' && (
            <div className="text-center">
              <Button
                onClick={handleConfirmSelection}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!containers.some(c => c.isSelected)}
              >
                Potvrdit výběr
              </Button>
            </div>
          )}

          {/* Zpráva */}
          <AnimatePresence>
            {gameMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur z-50"
              >
                <div className="bg-white rounded-lg p-8 text-center">
                  <h2 className="text-3xl font-bold mb-2">{gameMessage}</h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pauza overlay */}
          {gameState === 'paused' && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-40">
              <Card className="bg-white/95">
                <CardContent className="p-6 text-center">
                  <h2 className="text-2xl font-bold mb-4">Hra pozastavena</h2>
                  <Button onClick={togglePause} size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Pokračovat
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Konec hry */}
      {gameState === 'gameOver' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-600">Konec hry! 💔</h2>
              <p className="text-gray-600">Došly ti životy!</p>
              
              <div className="space-y-2 text-sm">
                <div>Dosažené skóre: <strong>{stats.score}</strong></div>
                <div>Dokončená kola: <strong>{stats.round - 1}/{config.totalRounds}</strong></div>
                <div>Správné odpovědi: <strong>{stats.correctAnswers}</strong></div>
                <div>Chybné odpovědi: <strong>{stats.incorrectAnswers}</strong></div>
              </div>
              
              <div className="space-y-2">
                <Button onClick={restartGame} size="lg" className="w-full">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Zkusit znovu
                </Button>
                
                {showBackButton && onBackToAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={onBackToAdmin}
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Zpět do administrace
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Výsledky */}
      {gameState === 'results' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-green-600">Skvělá práce! 🎉</h2>
              <p className="text-gray-600">Dokončil jsi všechna kola!</p>
              
              <div className="space-y-2 text-sm">
                <div>Celkové skóre: <strong>{stats.score}</strong></div>
                <div>Správné odpovědi: <strong>{stats.correctAnswers}</strong></div>
                <div>Chybné odpovědi: <strong>{stats.incorrectAnswers}</strong></div>
                <div>Úspěšnost: <strong>{Math.round((stats.correctAnswers / (stats.correctAnswers + stats.incorrectAnswers)) * 100)}%</strong></div>
              </div>
              
              <div className="space-y-2">
                <Button onClick={restartGame} size="lg" className="w-full">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Hrát znovu
                </Button>
                
                {showBackButton && onBackToAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={onBackToAdmin}
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Zpět do administrace
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default WhichIsMoreGame;