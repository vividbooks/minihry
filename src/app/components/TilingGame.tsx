import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TilingGrid } from './TilingGrid';
import { TilePanel } from './TilePanel';
import { useAudio } from './AudioManager';
import { GameResultScreen } from './GameResultScreen';
import {
  TilingLevel,
  PlacedTile,
  GamePhase,
  TilingGameProps,
  DEFAULT_LEVELS,
  TILING_COLORS,
  TILE_SHAPES,
  getTilePatternWithRotation,
  generateRandomLevel,
  calculateCoverage,
  countUsedShapes,
} from '../constants/tilingData';

interface DraggedShape {
  shapeId: string;
  rotation: number;
  colors: Record<string, string>;
}

interface TouchDragState {
  isDragging: boolean;
  startPosition: { x: number; y: number };
  ghostElement: HTMLElement | null;
}

export function TilingGame({ settings = {} }: TilingGameProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [draggedShape, setDraggedShape] = useState<DraggedShape | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>({
    phase: 'placing',
    userCounts: {},
    isCorrect: false
  });
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showGameResult, setShowGameResult] = useState(false);
  const [gameResultType, setGameResultType] = useState<'success' | 'failure'>('success');
  const [customLevels, setCustomLevels] = useState<TilingLevel[]>(DEFAULT_LEVELS);
  const [touchDragState, setTouchDragState] = useState<TouchDragState>({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    ghostElement: null
  });

  const { playSound } = useAudio();
  const currentLevel = customLevels[currentLevelIndex] || DEFAULT_LEVELS[0];

  // Inicializace náhodných levelů při načtení
  useEffect(() => {
    const newLevels = [
      generateRandomLevel(1),
      generateRandomLevel(2),
      generateRandomLevel(3),
    ];
    setCustomLevels(newLevels);
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((shapeId: string, rotation: number, colors: Record<string, string>, event: React.TouchEvent) => {
    event.preventDefault();
    
    if (gamePhase.phase !== 'placing') return;
    
    const touch = event.touches[0];
    setDraggedShape({ shapeId, rotation, colors });
    setTouchDragState({
      isDragging: true,
      startPosition: { x: touch.clientX, y: touch.clientY },
      ghostElement: null
    });
  }, [gamePhase.phase]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchDragState.isDragging || !draggedShape) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    
    // Vytvoření ghost elementu při prvním move
    if (!touchDragState.ghostElement) {
      const ghostElement = document.createElement('div');
      ghostElement.style.position = 'fixed';
      ghostElement.style.pointerEvents = 'none';
      ghostElement.style.zIndex = '1000';
      ghostElement.style.opacity = '0.7';
      ghostElement.style.transform = 'translate(-50%, -50%)';
      
      // Vytvoření vizuální reprezentace dlaždice
      const pattern = getTilePatternWithRotation(draggedShape.shapeId, draggedShape.rotation);
      const baseColor = draggedShape.colors[draggedShape.shapeId] || TILE_SHAPES[draggedShape.shapeId]?.color || '#4CAF50';
      const cellSize = 20; // Menší velikost pro ghost
      
      let innerHTML = '<div style="display: grid; gap: 1px;">';
      pattern.forEach((row, rowIndex) => {
        innerHTML += '<div style="display: flex; gap: 1px;">';
        row.forEach((cell, colIndex) => {
          if (cell) {
            innerHTML += `<div style="width: ${cellSize}px; height: ${cellSize}px; background-color: ${baseColor}; border-radius: 2px;"></div>`;
          } else {
            innerHTML += `<div style="width: ${cellSize}px; height: ${cellSize}px;"></div>`;
          }
        });
        innerHTML += '</div>';
      });
      innerHTML += '</div>';
      
      ghostElement.innerHTML = innerHTML;
      document.body.appendChild(ghostElement);
      
      setTouchDragState(prev => ({ ...prev, ghostElement }));
    }
    
    // Update pozice ghost elementu
    if (touchDragState.ghostElement) {
      touchDragState.ghostElement.style.left = `${touch.clientX}px`;
      touchDragState.ghostElement.style.top = `${touch.clientY}px`;
    }
  }, [touchDragState.isDragging, touchDragState.ghostElement, draggedShape]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchDragState.isDragging || !draggedShape) return;
    
    const touch = event.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const tilingGrid = element?.closest('[data-tiling-grid]') as HTMLElement;
    
    if (tilingGrid) {
      const gridRect = tilingGrid.getBoundingClientRect();
      const cellSize = parseFloat(tilingGrid.dataset.cellSize || '50');
      const x = Math.floor((touch.clientX - gridRect.left) / cellSize);
      const y = Math.floor((touch.clientY - gridRect.top) / cellSize);
      
      // Dispatch custom event pro drop
      const dropEvent = new CustomEvent('touchDrop', {
        detail: { x, y, shapeId: draggedShape.shapeId, rotation: draggedShape.rotation }
      });
      tilingGrid.dispatchEvent(dropEvent);
    }
    
    // Cleanup
    if (touchDragState.ghostElement) {
      document.body.removeChild(touchDragState.ghostElement);
    }
    
    setTouchDragState({
      isDragging: false,
      startPosition: { x: 0, y: 0 },
      ghostElement: null
    });
    setDraggedShape(null);
  }, [touchDragState.isDragging, touchDragState.ghostElement, draggedShape]);

  // Global touch event listeners
  useEffect(() => {
    if (touchDragState.isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [touchDragState.isDragging, handleTouchMove, handleTouchEnd]);

  // Cleanup při unmount
  useEffect(() => {
    return () => {
      if (touchDragState.ghostElement) {
        document.body.removeChild(touchDragState.ghostElement);
      }
    };
  }, []);

  // Event handlers
  const handleTilePlace = useCallback((tile: PlacedTile) => {
    setPlacedTiles(prev => [...prev, tile]);
    setDraggedShape(null);
    playSound('correct');
  }, [playSound]);

  const handleTileRemove = useCallback((tileId: string) => {
    setPlacedTiles(prev => prev.filter(tile => tile.id !== tileId));
  }, []);

  const handleLevelSelect = useCallback((levelIndex: number) => {
    setCurrentLevelIndex(levelIndex);
    setPlacedTiles([]);
    setGamePhase({ phase: 'placing', userCounts: {}, isCorrect: false });
    setShowSuccessOverlay(false);
    setShowGameResult(false);
  }, []);

  const handleClearAll = useCallback(() => {
    setPlacedTiles([]);
    playSound('incorrect');
  }, [playSound]);

  const handleNewPuzzle = useCallback(() => {
    const newLevel = generateRandomLevel(currentLevel.difficulty);
    const newLevels = [...customLevels];
    newLevels[currentLevelIndex] = newLevel;
    setCustomLevels(newLevels);
    setPlacedTiles([]);
    setGamePhase({ phase: 'placing', userCounts: {}, isCorrect: false });
    setShowSuccessOverlay(false);
    setShowGameResult(false);
    playSound('correct');
  }, [currentLevel.difficulty, customLevels, currentLevelIndex, playSound]);

  const handlePlaceTiles = useCallback(() => {
    const coverage = calculateCoverage(
      currentLevel.gridWidth || currentLevel.gridSize,
      currentLevel.gridHeight || currentLevel.gridSize,
      placedTiles
    );
    
    setShowSuccessOverlay(true);
    playSound('gameComplete');
    
    setTimeout(() => {
      setShowSuccessOverlay(false);
      setGamePhase({ phase: 'counting', userCounts: {}, isCorrect: false });
    }, 2000);
  }, [currentLevel, placedTiles, playSound]);

  const handleUserCountChange = useCallback((shapeId: string, count: number) => {
    setGamePhase(prev => ({
      ...prev,
      userCounts: { ...prev.userCounts, [shapeId]: count }
    }));
  }, []);

  const handleCheckCounts = useCallback(() => {
    const actualCounts = countUsedShapes(placedTiles);
    let isCorrect = true;
    
    // Kontrola všech použitých tvarů
    Object.keys(actualCounts).forEach(shapeId => {
      if (gamePhase.userCounts[shapeId] !== actualCounts[shapeId]) {
        isCorrect = false;
      }
    });
    
    setGamePhase(prev => ({ ...prev, phase: 'completed', isCorrect }));
    
    // Zobrazení univerzálních hlášek
    setGameResultType(isCorrect ? 'success' : 'failure');
    setShowGameResult(true);
  }, [placedTiles, gamePhase.userCounts]);

  const handleDragStart = useCallback((shapeId: string, rotation: number, colors: Record<string, string>) => {
    setDraggedShape({ shapeId, rotation, colors });
  }, []);

  // Výpočty pro UI
  const coverage = calculateCoverage(
    currentLevel.gridWidth || currentLevel.gridSize,
    currentLevel.gridHeight || currentLevel.gridSize,
    placedTiles
  );
  
  const actualCounts = countUsedShapes(placedTiles);
  const usedShapes = Object.keys(actualCounts).filter(shapeId => actualCounts[shapeId] > 0);

  return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: TILING_COLORS.PAGE_BACKGROUND }}>
      {/* Hlavní herní oblast - vycentrovaná na výšku */}
      <div className="flex flex-col lg:flex-row px-4 gap-4 w-full max-w-7xl">
        {/* Grid - vlevo na desktopu, nahoře na mobilu */}
        <div className="flex-1 lg:flex-[2]">
          <TilingGrid
            level={currentLevel}
            placedTiles={placedTiles}
            onTilePlace={handleTilePlace}
            onTileRemove={handleTileRemove}
            draggedShape={draggedShape}
            gamePhase={gamePhase.phase}
          />
        </div>

        {/* Panel - vpravo na desktopu, dole na mobilu */}
        <div className="w-full lg:w-96 lg:flex-shrink-0 flex items-center">
          <TilePanel
            level={currentLevel}
            placedTiles={placedTiles}
            gamePhase={gamePhase}
            coverage={coverage}
            actualCounts={actualCounts}
            usedShapes={usedShapes}
            currentLevelIndex={currentLevelIndex}
            onLevelSelect={handleLevelSelect}
            onClearAll={handleClearAll}
            onNewPuzzle={handleNewPuzzle}
            onPlaceTiles={handlePlaceTiles}
            onUserCountChange={handleUserCountChange}
            onCheckCounts={handleCheckCounts}
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
          />
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-xl p-8 text-center shadow-2xl max-w-md mx-4"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#4e5871] mb-2">
                Položení dokončeno!
              </h2>
              <p className="text-lg text-[#666666] mb-4">
                Pokrytí: {Math.round(coverage)}%
              </p>
              <p className="text-base text-[#666666]">
                Kolik dlaždic jsi použil?
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Univerzální hlášky pro výsledky */}
      {showGameResult && (
        <GameResultScreen
          isSuccess={gameResultType === 'success'}
          onContinue={() => {
            setShowGameResult(false);
            if (gameResultType === 'success') {
              // Pokračovat s další hrou nebo resetovat
              handleNewPuzzle();
            } else {
              // Umožnit opakování
              setGamePhase(prev => ({ ...prev, phase: 'counting' }));
            }
          }}
          autoHideDuration={undefined}
          successText={gameResultType === 'success' ? 
            ['Skvělá práce! 🎯', 'Výborně spočítáno! 🧮', 'Perfektní výsledek! ⭐', 'Máš to! 🏆'][Math.floor(Math.random() * 4)] :
            undefined
          }
          failureText={gameResultType === 'failure' ? 
            ['Zkus to znovu! 🤔', 'Málem to bylo! 💪', 'Další pokus! 🎲', 'Neboj se, zvládneš to! 🌟'][Math.floor(Math.random() * 4)] :
            undefined
          }
          showContinueButton={true}
          displayType="gameComplete"
        />
      )}
    </div>
  );
}