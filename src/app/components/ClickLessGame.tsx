import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Heart, Star } from 'lucide-react';
import { TimeIndicator } from './TimeIndicator';
import { GameResultScreen } from './GameResultScreen';

interface ClickLessGameProps {
  settings?: Record<string, any>;
  onGameComplete?: (score: number, lives: number) => void;
}

const GAME_OBJECTS = [
  '🍎', '🍌', '🍊', '🍓', '🍇', '🥕', '🌽', '🍄', '🌸', '🌺',
  '⭐', '💎', '🎈', '🎁', '🏀', '⚽', '🎲', '🧸'
];

export function ClickLessGame({ settings, onGameComplete }: ClickLessGameProps) {
  const maxLives = settings?.maxLives || 3;
  const timeLimit = settings?.timeLimit || 20;
  const objectRange = settings?.objectRange || [2, 8];
  const timeBasedGame = settings?.timeBasedGame !== false;
  const currentRound = settings?.currentRound || 1;
  const totalRounds = settings?.totalRounds || 15;

  const [lives, setLives] = useState(maxLives);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [targetCount, setTargetCount] = useState(0);
  const [clickedCount, setClickedCount] = useState(0);
  const [objects, setObjects] = useState<{ id: number; type: string; x: number; y: number; clicked: boolean }[]>([]);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showResult, setShowResult] = useState<{ isSuccess: boolean; message: string } | null>(null);

  const generateGameData = useCallback(() => {
    const minObjects = Math.max(3, objectRange[0]);
    const maxObjects = Math.min(15, objectRange[1]);
    const totalObjects = Math.floor(Math.random() * (maxObjects - minObjects + 1)) + minObjects;
    const target = Math.floor(totalObjects * 0.4) + 1;

    setTargetCount(target);
    setClickedCount(0);

    const objectType = GAME_OBJECTS[Math.floor(Math.random() * GAME_OBJECTS.length)];
    const newObjects = [];

    for (let i = 0; i < totalObjects; i++) {
      newObjects.push({
        id: i,
        type: objectType,
        x: Math.random() * 85 + 7.5,
        y: Math.random() * 85 + 7.5,
        clicked: false
      });
    }

    setObjects(newObjects);
  }, [objectRange]);

  useEffect(() => {
    generateGameData();
  }, [generateGameData]);

  useEffect(() => {
    if (!timeBasedGame || !isGameActive) return;

    if (timeLeft <= 0) {
      handleGameEnd(false, "Čas vypršel!");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isGameActive, timeBasedGame]);

  useEffect(() => {
    if (clickedCount >= targetCount && isGameActive) {
      handleGameEnd(true, `Skvělé! Naklikal jsi pouze ${clickedCount} objektů!`);
    }
  }, [clickedCount, targetCount, isGameActive]);

  const handleGameEnd = useCallback((isSuccess: boolean, message: string) => {
    setIsGameActive(false);
    
    if (!isSuccess) {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setShowResult({ isSuccess: false, message: "Hra skončila!" });
        setTimeout(() => onGameComplete?.(0, 0), 2000);
        return;
      }
    }

    setShowResult({ isSuccess, message });
    setTimeout(() => {
      onGameComplete?.(isSuccess ? 1 : 0, isSuccess ? lives : lives - 1);
    }, 1500);
  }, [lives, onGameComplete]);

  const handleObjectClick = useCallback((objectId: number) => {
    if (!isGameActive) return;

    setObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, clicked: true } : obj
    ));
    setClickedCount(prev => prev + 1);
  }, [isGameActive]);

  if (showResult) {
    return (
      <GameResultScreen
        isSuccess={showResult.isSuccess}
        successText={showResult.message}
        failureText={showResult.message}
        displayType="roundResult"
      />
    );
  }

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{ backgroundColor: settings?.backgroundColor || '#F5E6D0' }}
    >
      <TimeIndicator 
        timeLeft={timeLeft} 
        totalTime={timeLimit} 
        isVisible={timeBasedGame && isGameActive} 
      />

      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-bold text-red-500">{lives}</span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {currentRound}/{totalRounds}
          </div>
        </div>
      </div>

      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
          <h1 className="text-xl font-bold">Naklikej méně objektů!</h1>
        </div>
      </div>

      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {clickedCount} / {targetCount}
            </div>
            <div className="text-sm text-gray-600">objektů (méně!)</div>
          </div>
        </div>
      </div>

      <div className="h-screen relative p-8">
        {objects.map((obj) => (
          <motion.button
            key={obj.id}
            className={`absolute text-4xl select-none transition-all duration-200 ${
              obj.clicked 
                ? 'opacity-30 scale-75 cursor-not-allowed' 
                : 'hover:scale-110 cursor-pointer'
            }`}
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => !obj.clicked && handleObjectClick(obj.id)}
            disabled={!isGameActive || obj.clicked}
            whileHover={!obj.clicked ? { scale: 1.2 } : {}}
            whileTap={!obj.clicked ? { scale: 0.95 } : {}}
          >
            {obj.type}
            {obj.clicked && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}