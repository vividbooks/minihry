import React, { useState, useEffect } from 'react';
import { GameGrid } from './GameGrid';
import { CompactControls } from './CompactControls';
import { Cell, evaluateGrid } from '../utils/mirrorDrawingLogic';
import { RandomShape, generateRandomLevel, Difficulty, APP_COLORS, COLORS } from '../constants/mirrorDrawingData';

// Typy nastavení hry
interface MirrorDrawingGameSettings {
  drawingMode?: 'mirror' | 'copy';
  difficulty?: 'easy' | 'medium' | 'hard';
  gridSizes?: number[];
  objectCount?: [number, number];
  enableEraser?: boolean;
  autoProgression?: boolean;
  progressionDelay?: number;
  showFeedback?: boolean;
  enableDragToDraw?: boolean;
  backgroundColor?: string;
}

interface MirrorDrawingGameProps {
  settings?: MirrorDrawingGameSettings;
}

export function MirrorDrawingGame({ settings = {} }: MirrorDrawingGameProps) {
  // Aplikování nastavení s fallback na výchozí hodnoty
  const gameConfig = {
    drawingMode: settings.drawingMode ?? 'mirror',
    difficulty: (settings.difficulty as Difficulty) ?? Difficulty.EASY,
    autoProgression: settings.autoProgression ?? true,
    progressionDelay: (settings.progressionDelay ?? 2) * 1000, // převod na ms
    showFeedback: settings.showFeedback ?? true,
    enableDragToDraw: settings.enableDragToDraw ?? true,
    backgroundColor: settings.backgroundColor ?? APP_COLORS.PAGE_BACKGROUND
  };
  const [currentLevel, setCurrentLevel] = useState<RandomShape | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[1]);
  const [rightGrid, setRightGrid] = useState<Record<string, Cell>>({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(gameConfig.difficulty);

  // Generuj první náhodný tvar při načtení
  useEffect(() => {
    generateNewLevel();
  }, [difficulty]);

  // Auto-progression po úspěšném dokončení
  useEffect(() => {
    if (isEvaluated && currentLevel) {
      const cells = Object.values(rightGrid);
      const correctCells = cells.filter(cell => cell.isCorrect === true).length;
      const totalCells = cells.length;
      const isComplete = correctCells === totalCells && totalCells > 0;
      
      if (isComplete && gameConfig.autoProgression) {
        // Automaticky načti další level po konfigurovaném čase
        const timer = setTimeout(() => {
          generateNewLevel();
        }, gameConfig.progressionDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isEvaluated, rightGrid, currentLevel]);

  const generateNewLevel = () => {
    const newLevel = generateRandomLevel(difficulty);
    setCurrentLevel(newLevel);
    handleReset();
  };

  const handleCellClick = (row: number, col: number) => {
    if (isEvaluated || !currentLevel) return;
    
    // V módu zrcadlení pouze pravá polovina je klikatelná
    // V módu kopírování je klikatelná celá pravá mřížka (což je implementováno v GameGrid)
    if (gameConfig.drawingMode === 'mirror' && col < currentLevel.gridSize / 2) return;
    
    const key = `${row},${col}`;
    const isEraser = selectedColor === COLORS[COLORS.length - 1]; // Poslední barva je guma
    
    setRightGrid(prev => {
      if (isEraser) {
        // Guma - odstraň buňku
        const newGrid = { ...prev };
        delete newGrid[key];
        return newGrid;
      } else {
        // Kreslení - přidej barvu
        return {
          ...prev,
          [key]: { color: selectedColor }
        };
      }
    });
  };

  const handleEvaluate = () => {
    if (!currentLevel) return;
    
    const newRightGrid = evaluateGrid(rightGrid, currentLevel, gameConfig.drawingMode);
    setRightGrid(newRightGrid);
    setIsEvaluated(true);
  };

  const handleReset = () => {
    setRightGrid({});
    setIsEvaluated(false);
  };

  // Zobraz loading dokud se negeneruje první level
  if (!currentLevel) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: gameConfig.backgroundColor }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🎲</div>
          <p style={{ color: APP_COLORS.TASK_TEXT }}>Generuji náhodný obrázek...</p>
        </div>
      </div>
    );
  }

  // Zkontroluj jestli je level dokončený
  const cells = Object.values(rightGrid);
  const correctCells = cells.filter(cell => cell.isCorrect === true).length;
  const totalCells = cells.length;
  const isComplete = correctCells === totalCells && totalCells > 0 && isEvaluated;

  // Dynamické popisky podle módu
  const getLabels = () => {
    if (gameConfig.drawingMode === 'copy') {
      return {
        left: 'VZOR',
        right: 'NAKRESLI'
      };
    } else {
      return {
        left: 'VZOR',
        right: 'DOKRESLI'
      };
    }
  };

  const labels = getLabels();

  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: gameConfig.backgroundColor }}
    >
      {/* Desktop layout - horizontální */}
      <div className="hidden lg:flex h-screen">
        {/* Mřížka vlevo */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex-1 w-full overflow-hidden">
            <GameGrid 
              level={currentLevel}
              rightGrid={rightGrid}
              onCellClick={handleCellClick}
              isEvaluated={isEvaluated}
              selectedColor={selectedColor}
              drawingMode={gameConfig.drawingMode}
            />
          </div>
          
          {/* Popisky */}
          <div className="flex justify-center py-2 w-full">
            <div className="flex justify-between w-full max-w-2xl">
              <div className="text-center flex-1">
                <p className="text-lg" style={{ color: APP_COLORS.TASK_TEXT }}>
                  {labels.left}
                </p>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg" style={{ color: APP_COLORS.TASK_TEXT }}>
                  {labels.right}
                </p>
              </div>
            </div>
          </div>
          
          {/* Výsledek */}
          {isEvaluated && (
            <div className="py-2 text-center">
              {isComplete ? (
                <div>
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-lg mb-1" style={{ color: '#4CAF50' }}>Perfektní!</p>
                  {gameConfig.autoProgression && (
                    <p className="text-sm text-gray-600">Další level se načte automaticky...</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-1" style={{ color: '#F7A800' }}>
                    {Math.round((correctCells / totalCells) * 100)}% správně
                  </p>
                  <p className="text-sm text-gray-600">Zkus to znovu! 💪</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ovládací prvky vpravo - vertikálně vycentrované */}
        <div className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <CompactControls
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              onEvaluate={handleEvaluate}
              onReset={handleReset}
              onNewLevel={generateNewLevel}
              isEvaluated={isEvaluated}
              gridSize={currentLevel.gridSize}
            />
          </div>
        </div>
      </div>

      {/* Mobile layout - vertikální */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Mřížka nahoře */}
        <div className="flex-1 flex flex-col p-2">
          <div className="flex-1 w-full overflow-hidden">
            <GameGrid 
              level={currentLevel}
              rightGrid={rightGrid}
              onCellClick={handleCellClick}
              isEvaluated={isEvaluated}
              selectedColor={selectedColor}
              drawingMode={gameConfig.drawingMode}
            />
          </div>
          
          {/* Popisky */}
          <div className="flex justify-center py-1 w-full">
            <div className="flex justify-between w-full max-w-sm">
              <div className="text-center flex-1">
                <p className="text-sm" style={{ color: APP_COLORS.TASK_TEXT }}>
                  {labels.left}
                </p>
              </div>
              <div className="text-center flex-1">
                <p className="text-sm" style={{ color: APP_COLORS.TASK_TEXT }}>
                  {labels.right}
                </p>
              </div>
            </div>
          </div>
          
          {/* Výsledek */}
          {isEvaluated && (
            <div className="py-1 text-center">
              {isComplete ? (
                <div>
                  <div className="text-2xl mb-1">🎉</div>
                  <p className="text-base mb-1" style={{ color: '#4CAF50' }}>Perfektní!</p>
                  {gameConfig.autoProgression && (
                    <p className="text-xs text-gray-600">Další level se načte automaticky...</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-1" style={{ color: '#F7A800' }}>
                    {Math.round((correctCells / totalCells) * 100)}% správně
                  </p>
                  <p className="text-xs text-gray-600">Zkus to znovu! 💪</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ovládací prvky dole */}
        <div className="p-4 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <CompactControls
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              onEvaluate={handleEvaluate}
              onReset={handleReset}
              onNewLevel={generateNewLevel}
              isEvaluated={isEvaluated}
              gridSize={currentLevel.gridSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}