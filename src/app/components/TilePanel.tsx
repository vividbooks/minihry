import React, { useState, useCallback } from 'react';
import { RotateCw, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { useAudio } from './AudioManager';
import {
  TilingLevel,
  PlacedTile,
  GamePhase,
  TILING_COLORS,
  TILE_SHAPES,
  getTilePatternWithRotation
} from '../constants/tilingData';

interface TilePanelProps {
  level: TilingLevel;
  placedTiles: PlacedTile[];
  gamePhase: GamePhase;
  coverage: number;
  actualCounts: Record<string, number>;
  usedShapes: string[];
  currentLevelIndex: number;
  onLevelSelect: (levelIndex: number) => void;
  onClearAll: () => void;
  onNewPuzzle: () => void;
  onPlaceTiles: () => void;
  onUserCountChange: (shapeId: string, count: number) => void;
  onCheckCounts: () => void;
  onDragStart: (shapeId: string, rotation: number, colors: Record<string, string>) => void;
  onTouchStart: (shapeId: string, rotation: number, colors: Record<string, string>, event: React.TouchEvent) => void;
}

export function TilePanel({
  level,
  placedTiles,
  gamePhase,
  coverage,
  actualCounts,
  usedShapes,
  currentLevelIndex,
  onLevelSelect,
  onClearAll,
  onNewPuzzle,
  onPlaceTiles,
  onUserCountChange,
  onCheckCounts,
  onDragStart,
  onTouchStart
}: TilePanelProps) {
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [rotatingShapes, setRotatingShapes] = useState<Record<string, boolean>>({});
  const { playSound } = useAudio();

  const handleRotate = useCallback((shapeId: string) => {
    // Přehrání zvuku
    playSound('click');
    
    // Animace rotace
    setRotatingShapes(prev => ({ ...prev, [shapeId]: true }));
    
    // Aktualizace rotace
    setRotations(prev => ({ ...prev, [shapeId]: ((prev[shapeId] || 0) + 1) % 4 }));
    
    // Ukončení animace po 200ms
    setTimeout(() => {
      setRotatingShapes(prev => ({ ...prev, [shapeId]: false }));
    }, 200);
  }, [playSound]);

  const getTileColor = useCallback((shapeId: string) => {
    return level.colors?.[shapeId] || TILE_SHAPES[shapeId]?.color || '#4CAF50';
  }, [level.colors]);

  const renderTileShape = useCallback((shapeId: string, size: number = 24) => {
    const rotation = rotations[shapeId] || 0;
    const pattern = getTilePatternWithRotation(shapeId, rotation);
    const color = getTileColor(shapeId);

    return (
      <div className="inline-block">
        <div
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${pattern.length}, ${size}px)`,
            gridTemplateColumns: `repeat(${pattern[0]?.length || 1}, ${size}px)`,
            gap: '1px',
          }}
        >
          {pattern.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: size,
                  height: size,
                  backgroundColor: cell ? color : 'transparent',
                  border: cell ? `1px solid ${color}` : 'none',
                  borderRadius: '2px',
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  }, [rotations, getTileColor]);

  const handleDragStart = useCallback((e: React.DragEvent, shapeId: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    const rotation = rotations[shapeId] || 0;
    const colors = level.colors || {};
    onDragStart(shapeId, rotation, colors);
  }, [rotations, level.colors, onDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent, shapeId: string) => {
    const rotation = rotations[shapeId] || 0;
    const colors = level.colors || {};
    onTouchStart(shapeId, rotation, colors, e);
  }, [rotations, level.colors, onTouchStart]);

  const handleCountChange = useCallback((shapeId: string, increment: boolean) => {
    const currentCount = gamePhase.userCounts[shapeId] || 0;
    const newCount = Math.max(0, Math.min(20, currentCount + (increment ? 1 : -1)));
    onUserCountChange(shapeId, newCount);
  }, [gamePhase.userCounts, onUserCountChange]);

  const getPhaseTitle = () => {
    switch (gamePhase.phase) {
      case 'placing':
        return 'Umísti dlaždice na dvorek';
      case 'counting':
        return 'Spočítej použité dlaždice';
      case 'completed':
        return 'Výsledek';
      default:
        return '';
    }
  };

  return (
    <div
      className="w-full max-h-[70vh] h-auto rounded-3xl shadow-lg p-6 overflow-y-auto"
      style={{
        backgroundColor: TILING_COLORS.PANEL_BACKGROUND
      }}
    >
      {/* Nadpis a podnadpis */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4e5871] mb-2">
          DLAŽDICE
        </h1>
        <div className="text-lg md:text-xl font-medium text-[#4e5871]">
          {getPhaseTitle()}
        </div>
      </div>

      {/* PLACING fáze */}
      {gamePhase.phase === 'placing' && (
        <>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-[#4e5871]">Pokrytí</h3>
              <span className="text-sm font-medium text-[#666666]">
                {Math.round(coverage)}%
              </span>
            </div>
            <Progress
              value={coverage}
              className="h-3"
              style={{
                backgroundColor: '#E0E0E0',
              }}
            />
          </div>

          {/* Dostupné tvary */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#4e5871] mb-3">Dostupné dlaždice</h3>
            <div className="grid grid-cols-2 gap-3">
              {level.availableShapes.map(shapeId => (
                <div
                  key={shapeId}
                  className="relative border-2 rounded-lg p-3 bg-gray-50"
                  style={{ borderColor: TILING_COLORS.PANEL_BORDER }}
                >
                  {/* Rotace tlačítko */}
                  <button
                    onClick={() => handleRotate(shapeId)}
                    className={`absolute top-1 right-1 p-1 rounded bg-white shadow-sm hover:bg-gray-100 transition-all ${
                      rotatingShapes[shapeId] ? 'rotate-90 scale-110' : 'rotate-0 scale-100'
                    }`}
                    style={{ color: TILING_COLORS.TEXT_SECONDARY }}
                    title="Otočit tvar (90°)"
                  >
                    <RotateCw size={12} />
                  </button>

                  {/* Draggable tvar */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, shapeId)}
                    onTouchStart={(e) => handleTouchStart(e, shapeId)}
                    className="flex justify-center items-center cursor-move hover:opacity-80 transition-opacity py-2"
                  >
                    {renderTileShape(shapeId, 32)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Akční tlačítka */}
          <div className="space-y-3">
            <Button
              onClick={onPlaceTiles}
              disabled={coverage < 100}
              className="w-full py-3 font-medium"
              style={{
                backgroundColor: coverage >= 100 ? TILING_COLORS.BUTTON_SUCCESS : '#E0E0E0',
                color: coverage >= 100 ? 'white' : '#999',
                border: 'none'
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Spočítat dlaždice
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={onNewPuzzle}
                className="flex-1 py-2 text-sm font-medium"
                style={{
                  backgroundColor: TILING_COLORS.BUTTON_PRIMARY,
                  color: 'white',
                  border: 'none'
                }}
              >
                🎲 Nový dvorek
              </Button>

              <Button
                onClick={onClearAll}
                className="flex-1 py-2 text-sm font-medium"
                style={{
                  backgroundColor: '#FF4D6D',
                  color: 'white',
                  border: 'none'
                }}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Vymazat
              </Button>
            </div>
          </div>
        </>
      )}

      {/* COUNTING fáze */}
      {gamePhase.phase === 'counting' && (
        <>
          <h3 className="text-lg font-bold text-[#4e5871] mb-4">Spočítej dlaždice:</h3>
          
          <div className="space-y-4 mb-6">
            {usedShapes.map(shapeId => (
              <div
                key={shapeId}
                className="flex items-center gap-3 p-3 border rounded-lg"
                style={{
                  borderColor: TILING_COLORS.PANEL_BORDER,
                  backgroundColor: '#F8F9FF'
                }}
              >
                {/* Vizuální reprezentace tvaru */}
                <div className="flex-shrink-0">
                  {renderTileShape(shapeId, 24)}
                </div>

                {/* Input a ovládání */}
                <div className="flex-1 flex items-center gap-2">
                  <button
                    onClick={() => handleCountChange(shapeId, false)}
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                  >
                    ▼
                  </button>

                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={gamePhase.userCounts[shapeId] || 0}
                    onChange={(e) => onUserCountChange(shapeId, parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center text-sm"
                    style={{ fontSize: '14px' }}
                  />

                  <button
                    onClick={() => handleCountChange(shapeId, true)}
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                  >
                    ▲
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={onCheckCounts}
            className="w-full py-3 font-medium"
            style={{
              backgroundColor: TILING_COLORS.BUTTON_PRIMARY,
              color: 'white',
              border: 'none'
            }}
          >
            Zkontrolovat
          </Button>
        </>
      )}

      {/* COMPLETED fáze */}
      {gamePhase.phase === 'completed' && (
        <>
          <h3 className="text-lg font-bold text-[#4e5871] mb-4">Výsledek:</h3>

          <div className="space-y-3 mb-6">
            {usedShapes.map(shapeId => {
              const userCount = gamePhase.userCounts[shapeId] || 0;
              const actualCount = actualCounts[shapeId] || 0;
              const isCorrect = userCount === actualCount;

              return (
                <div
                  key={shapeId}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                  style={{
                    borderColor: isCorrect ? TILING_COLORS.BUTTON_SUCCESS : '#FF4D6D',
                    backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                    borderWidth: '2px'
                  }}
                >
                  <div className="flex-shrink-0">
                    {renderTileShape(shapeId, 24)}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {userCount} / {actualCount} {isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {gamePhase.isCorrect && (
            <div className="text-center mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="text-lg font-bold text-green-700">🎉 Správně spočítáno! 🎉</div>
            </div>
          )}

          <Button
            onClick={onNewPuzzle}
            className="w-full py-3 font-medium"
            style={{
              backgroundColor: TILING_COLORS.BUTTON_PRIMARY,
              color: 'white',
              border: 'none'
            }}
          >
            🎲 Nový dvorek
          </Button>
        </>
      )}
    </div>
  );
}