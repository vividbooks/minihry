import React, { useState, useCallback } from 'react';
import { RobotGrid } from './RobotGrid';
import { CommandPanel } from './CommandPanel';
import { 
  Direction, 
  RobotLevel, 
  ROBOT_LEVEL_TEMPLATES, 
  ROBOT_COLORS,
  ROBOT_LEVELS,
  generateLevelFromTemplate,
  initializeRandomLevels
} from '../constants/robotData';

interface GameSettings {
  difficulty?: number;
  gridSize?: number;
  collectiblePoints?: number;
}

interface RobotGameProps {
  settings?: GameSettings;
}

export function RobotGame({ settings = {} }: RobotGameProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [commands, setCommands] = useState<Direction[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameResult, setGameResult] = useState<'success' | 'failure' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [levels, setLevels] = useState<RobotLevel[]>(() => {
    const initialLevels = initializeRandomLevels();
    ROBOT_LEVELS.splice(0, ROBOT_LEVELS.length, ...initialLevels);
    return initialLevels;
  });

  const currentLevel = levels[currentLevelIndex] || levels[0];

  const handleAddCommand = useCallback((direction: Direction) => {
    if (!isAnimating) {
      setCommands(prev => [...prev, direction]);
    }
  }, [isAnimating]);

  const handleClearCommands = useCallback(() => {
    if (!isAnimating) {
      setCommands([]);
      setGameResult(null);
      setShowResult(false);
    }
  }, [isAnimating]);

  const handleExecute = useCallback(() => {
    if (commands.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setGameResult(null);
      setShowResult(false);
    }
  }, [commands.length, isAnimating]);

  const handleAnimationComplete = useCallback((success: boolean) => {
    setIsAnimating(false);
    setGameResult(success ? 'success' : 'failure');
    setShowResult(true);

    if (success) {
      setTimeout(() => {
        const newLevel = generateLevelFromTemplate(ROBOT_LEVEL_TEMPLATES[currentLevelIndex]);
        
        const newLevels = [...levels];
        newLevels[currentLevelIndex] = newLevel;
        setLevels(newLevels);
        ROBOT_LEVELS[currentLevelIndex] = newLevel;
        
        setCommands([]);
        setGameResult(null);
        setShowResult(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowResult(false);
        setGameResult(null);
      }, 2000);
    }
  }, [currentLevelIndex, levels]);

  const handleRegenerateCurrentLevel = () => {
    if (!isAnimating) {
      const newLevel = generateLevelFromTemplate(ROBOT_LEVEL_TEMPLATES[currentLevelIndex]);
      
      const newLevels = [...levels];
      newLevels[currentLevelIndex] = newLevel;
      setLevels(newLevels);
      ROBOT_LEVELS[currentLevelIndex] = newLevel;
      
      setCommands([]);
      setGameResult(null);
      setShowResult(false);
    }
  };

  const handleLevelSelect = (levelIndex: number) => {
    if (levelIndex !== currentLevelIndex && !isAnimating) {
      setCurrentLevelIndex(levelIndex);
      setCommands([]);
      setGameResult(null);
      setShowResult(false);
    }
  };

  // Zobraz loading pokud se levely ještě nenačetly
  if (!levels.length || !currentLevel) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: ROBOT_COLORS.PAGE_BACKGROUND }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <p style={{ color: ROBOT_COLORS.TEXT_PRIMARY }}>Generuji levely...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ backgroundColor: ROBOT_COLORS.PAGE_BACKGROUND }}
    >
      
      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen gap-4">
        
        {/* Mřížka vlevo - větší plocha */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <div className="flex-1 w-full overflow-hidden flex items-center justify-center">
            <RobotGrid 
              level={currentLevel}
              isAnimating={isAnimating}
              commands={commands}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>
          
          {/* Overlay výsledku */}
          {showResult && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div 
                className="rounded-2xl p-8 shadow-2xl border-2 text-center"
                style={{
                  backgroundColor: ROBOT_COLORS.PANEL_BACKGROUND,
                  borderColor: ROBOT_COLORS.PANEL_BORDER,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {gameResult === 'success' ? (
                  <div>
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="text-2xl mb-2" style={{ color: ROBOT_COLORS.BUTTON_SUCCESS }}>Výborně!</p>
                    <p className="text-lg" style={{ color: ROBOT_COLORS.TEXT_SECONDARY }}>
                      {currentLevel.collectiblePoints && currentLevel.collectiblePoints.length > 0 
                        ? 'Robot sebral všechny body a dosáhl cíle!' 
                        : 'Robot dosáhl cíle!'
                      }
                    </p>
                    <p className="text-sm mt-2" style={{ color: ROBOT_COLORS.TEXT_SECONDARY }}>Spouští se nová hra...</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-4">😅</div>
                    <p className="text-2xl mb-2" style={{ color: '#F7A800' }}>Zkus to znovu!</p>
                    <p className="text-lg" style={{ color: ROBOT_COLORS.TEXT_SECONDARY }}>
                      {currentLevel.collectiblePoints && currentLevel.collectiblePoints.length > 0 
                        ? 'Robot nesebral všechny body nebo se nedostal k cíli' 
                        : 'Robot se nedostal k cíli'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ovládací panel vpravo - užší kvůli větší mřížce */}
        <div className="w-80 flex flex-col justify-center pt-8">
          <CommandPanel
            commands={commands}
            onAddCommand={handleAddCommand}
            onClearCommands={handleClearCommands}
            onExecute={handleExecute}
            isAnimating={isAnimating}
            currentLevelIndex={currentLevelIndex}
            levels={levels}
            onLevelSelect={handleLevelSelect}
            onRegenerateLevel={handleRegenerateCurrentLevel}
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col h-screen">
        
        {/* Mřížka nahoře - více prostoru */}
        <div className="flex-1 flex flex-col p-2 relative">
          <div className="flex-1 w-full overflow-hidden flex items-center justify-center">
            <RobotGrid 
              level={currentLevel}
              isAnimating={isAnimating}
              commands={commands}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>
          
          {/* Overlay výsledku */}
          {showResult && (
            <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
              <div 
                className="rounded-xl p-6 shadow-2xl border-2 text-center"
                style={{
                  backgroundColor: ROBOT_COLORS.PANEL_BACKGROUND,
                  borderColor: ROBOT_COLORS.PANEL_BORDER,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {gameResult === 'success' ? (
                  <div>
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-xl mb-2" style={{ color: ROBOT_COLORS.BUTTON_SUCCESS }}>Výborně!</p>
                    <p className="text-base" style={{ color: ROBOT_COLORS.TEXT_SECONDARY }}>
                      {currentLevel.collectiblePoints && currentLevel.collectiblePoints.length > 0 
                        ? 'Robot sebral všechny body a dosáhl cíle!' 
                        : 'Robot dosáhl cíle!'
                      }
                    </p>
                    <p className="text-xs mt-2" style={{ color: ROBOT_COLORS.TEXT_SECONDARY }}>Spouští se nová hra...</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">😅</div>
                    <p className="text-xl mb-2" style={{ color: '#F7A800' }}>Zkus to znovu!</p>
                    <p className="text-base" style={{ color: ROBOT_COLORS.TEXT_SECONDARY }}>
                      {currentLevel.collectiblePoints && currentLevel.collectiblePoints.length > 0 
                        ? 'Robot nesebral všechny body nebo se nedostal k cíli' 
                        : 'Robot se nedostal k cíli'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ovládací panel dole - kompaktní verze */}
        <div className="p-4">
          <CommandPanel
            commands={commands}
            onAddCommand={handleAddCommand}
            onClearCommands={handleClearCommands}
            onExecute={handleExecute}
            isAnimating={isAnimating}
            currentLevelIndex={currentLevelIndex}
            levels={levels}
            onLevelSelect={handleLevelSelect}
            onRegenerateLevel={handleRegenerateCurrentLevel}
          />
        </div>
      </div>
    </div>
  );
}