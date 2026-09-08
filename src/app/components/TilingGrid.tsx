import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  TilingLevel,
  PlacedTile,
  TILING_COLORS,
  TILE_SHAPES,
  getTilePatternWithRotation,
  canPlaceTile,
  getDarkerColor
} from '../constants/tilingData';

interface TilingGridProps {
  level: TilingLevel;
  placedTiles: PlacedTile[];
  onTilePlace: (tile: PlacedTile) => void;
  onTileRemove: (tileId: string) => void;
  draggedShape: { shapeId: string; rotation: number; colors: Record<string, string> } | null;
  gamePhase: 'placing' | 'counting' | 'completed';
}

interface HoverPosition {
  x: number;
  y: number;
}

export function TilingGrid({
  level,
  placedTiles,
  onTilePlace,
  onTileRemove,
  draggedShape,
  gamePhase
}: TilingGridProps) {
  const [hoverPosition, setHoverPosition] = useState<HoverPosition | null>(null);
  const [canDrop, setCanDrop] = useState(false);
  const [invalidDropTimeout, setInvalidDropTimeout] = useState<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const gridWidth = level.gridWidth || level.gridSize;
  const gridHeight = level.gridHeight || level.gridSize;

  // Dynamický výpočet velikosti buněk - upraveno pro 80% obrazovky
  const cellSize = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    const isMobile = viewportWidth < 1024;
    
    // Použijeme 80% viewport pro grid
    let availableWidth = viewportWidth * 0.8 - 32; // Odečteme padding (16px * 2)
    let availableHeight = viewportHeight * 0.8 - 32; // Odečteme padding (16px * 2)
    
    if (isMobile) {
      // Na mobilu trochu menší rezerva
      availableWidth = viewportWidth * 0.75 - 32;
      availableHeight = viewportHeight * 0.7 - 32;
    } else {
      // Na desktopu můžeme být štědřejší
      availableWidth = viewportWidth * 0.8 - 32;
      availableHeight = viewportHeight * 0.8 - 32;
    }
    
    const maxCellWidth = Math.floor(availableWidth / gridWidth);
    const maxCellHeight = Math.floor(availableHeight / gridHeight);
    const computedSize = Math.min(maxCellWidth, maxCellHeight);
    
    const minSize = 30;
    const maxSize = 120; // Zvýšíme maximální velikost pro větší grid
    
    return Math.max(minSize, Math.min(maxSize, computedSize));
  }, [gridWidth, gridHeight]);

  // Drag event handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!draggedShape || gamePhase !== 'placing') return;
    
    e.preventDefault();
    
    // Clear existing timeout
    if (invalidDropTimeout) {
      clearTimeout(invalidDropTimeout);
      setInvalidDropTimeout(null);
    }
    
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    // Upravení výpočtu pozice kvůli paddingu
    const x = Math.floor((e.clientX - rect.left - 16) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 16) / cellSize);
    
    setHoverPosition({ x, y });
    
    // Kontrola zda lze umístit
    const pattern = getTilePatternWithRotation(draggedShape.shapeId, draggedShape.rotation);
    const canPlace = canPlaceTile(pattern, x, y, gridWidth, gridHeight, placedTiles);
    setCanDrop(canPlace);
  }, [draggedShape, gamePhase, invalidDropTimeout, cellSize, gridWidth, gridHeight, placedTiles]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Pouze pokud opouštíme grid kompletně
    if (!gridRef.current?.contains(e.relatedTarget as Node)) {
      if (canDrop) {
        // Platné umístění - okamžitě vyčistit
        setHoverPosition(null);
        setCanDrop(false);
      } else {
        // Neplatné umístění - nechat červený X na 1.5s
        const timeout = setTimeout(() => {
          setHoverPosition(null);
          setCanDrop(false);
        }, 1500);
        setInvalidDropTimeout(timeout);
      }
    }
  }, [canDrop]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!draggedShape || !hoverPosition || !canDrop) return;
    
    e.preventDefault();
    
    // Clear timeouts
    if (invalidDropTimeout) {
      clearTimeout(invalidDropTimeout);
      setInvalidDropTimeout(null);
    }
    
    const pattern = getTilePatternWithRotation(draggedShape.shapeId, draggedShape.rotation);
    
    const newTile: PlacedTile = {
      id: `${draggedShape.shapeId}-${Date.now()}-${Math.random()}`,
      shapeId: draggedShape.shapeId,
      x: hoverPosition.x,
      y: hoverPosition.y,
      rotation: draggedShape.rotation,
      pattern,
      isPlaced: true
    };
    
    onTilePlace(newTile);
    setHoverPosition(null);
    setCanDrop(false);
  }, [draggedShape, hoverPosition, canDrop, invalidDropTimeout, onTilePlace]);

  // Touch drop handler
  const handleTouchDrop = useCallback((event: CustomEvent) => {
    const { x, y, shapeId, rotation } = event.detail;
    
    if (!shapeId || gamePhase !== 'placing') return;
    
    const pattern = getTilePatternWithRotation(shapeId, rotation);
    const canPlace = canPlaceTile(pattern, x, y, gridWidth, gridHeight, placedTiles);
    
    if (canPlace) {
      const colors = level.colors || {};
      const newTile: PlacedTile = {
        id: `${shapeId}-${Date.now()}-${Math.random()}`,
        shapeId,
        x,
        y,
        rotation,
        pattern,
        isPlaced: true
      };
      
      onTilePlace(newTile);
    }
  }, [gamePhase, gridWidth, gridHeight, placedTiles, level.colors, onTilePlace]);

  // Touch event listener
  useEffect(() => {
    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener('touchDrop', handleTouchDrop as EventListener);
      return () => {
        grid.removeEventListener('touchDrop', handleTouchDrop as EventListener);
      };
    }
  }, [handleTouchDrop]);

  // Cleanup timeout při unmount
  useEffect(() => {
    return () => {
      if (invalidDropTimeout) {
        clearTimeout(invalidDropTimeout);
      }
    };
  }, [invalidDropTimeout]);

  // Získání barvy pro tile nebo preview
  const getTileColor = useCallback((shapeId: string) => {
    return level.colors?.[shapeId] || TILE_SHAPES[shapeId]?.color || '#4CAF50';
  }, [level.colors]);

  // Kontrola zda buňka má souseda v daném směru
  const hasNeighbor = useCallback((tile: PlacedTile, rowIndex: number, colIndex: number, direction: 'top' | 'right' | 'bottom' | 'left') => {
    const currentX = tile.x + colIndex;
    const currentY = tile.y + rowIndex;
    
    let checkX = currentX;
    let checkY = currentY;
    
    switch (direction) {
      case 'top': checkY -= 1; break;
      case 'right': checkX += 1; break;
      case 'bottom': checkY += 1; break;
      case 'left': checkX -= 1; break;
    }
    
    // Kontrola zda je soused součástí stejné dlaždice
    return tile.pattern[checkY - tile.y]?.[checkX - tile.x] === true;
  }, []);

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-1 pt-4">
      <div
        ref={gridRef}
        data-tiling-grid="true"
        data-cell-size={cellSize}
        className="relative border-2 rounded-lg shadow-lg p-4"
        style={{
          backgroundColor: TILING_COLORS.GRID_BACKGROUND,
          borderColor: TILING_COLORS.PANEL_BORDER,
          width: typeof window !== 'undefined' 
            ? Math.min(gridWidth * cellSize + 32, window.innerWidth * 0.8) 
            : gridWidth * cellSize + 32,
          height: typeof window !== 'undefined' 
            ? Math.min(gridHeight * cellSize + 32, window.innerHeight * 0.8) 
            : gridHeight * cellSize + 32,
          maxWidth: '80vw', // Fallback pro responsive design
          maxHeight: '80vh'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Grid lines */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: '16px',
            top: '16px'
          }}
          width={gridWidth * cellSize}
          height={gridHeight * cellSize}
        >
          {/* Vertikální čáry */}
          {Array.from({ length: gridWidth + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * cellSize}
              y1={0}
              x2={i * cellSize}
              y2={gridHeight * cellSize}
              stroke={TILING_COLORS.GRID_LINES}
              strokeWidth={1}
            />
          ))}
          {/* Horizontální čáry */}
          {Array.from({ length: gridHeight + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * cellSize}
              x2={gridWidth * cellSize}
              y2={i * cellSize}
              stroke={TILING_COLORS.GRID_LINES}
              strokeWidth={1}
            />
          ))}
        </svg>

        {/* Umístěné dlaždice */}
        {placedTiles.map((tile) => {
          const baseColor = getTileColor(tile.shapeId);
          const outlineColor = getDarkerColor(baseColor);
          
          return (
            <React.Fragment key={tile.id}>
              {/* Pozadí buněk */}
              {tile.pattern.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  if (!cell) return null;
                  
                  const cellX = tile.x + colIndex;
                  const cellY = tile.y + rowIndex;
                  
                  return (
                    <div
                      key={`${tile.id}-bg-${rowIndex}-${colIndex}`}
                      className="absolute cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        left: cellX * cellSize + 1 + 16,
                        top: cellY * cellSize + 1 + 16,
                        width: cellSize - 2,
                        height: cellSize - 2,
                        backgroundColor: baseColor,
                        zIndex: 3
                      }}
                      onClick={() => gamePhase === 'placing' && onTileRemove(tile.id)}
                      title="Klikni pro odstranění"
                    />
                  );
                })
              )}
              
              {/* Vnější outline */}
              {tile.pattern.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  if (!cell) return null;
                  
                  const cellX = tile.x + colIndex;
                  const cellY = tile.y + rowIndex;
                  
                  const hasTopNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'top');
                  const hasRightNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'right');
                  const hasBottomNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'bottom');
                  const hasLeftNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'left');
                  
                  return (
                    <div
                      key={`${tile.id}-border-${rowIndex}-${colIndex}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: cellX * cellSize + 16,
                        top: cellY * cellSize + 16,
                        width: cellSize,
                        height: cellSize,
                        borderTop: !hasTopNeighbor ? `2px solid ${outlineColor}` : 'none',
                        borderRight: !hasRightNeighbor ? `2px solid ${outlineColor}` : 'none',
                        borderBottom: !hasBottomNeighbor ? `2px solid ${outlineColor}` : 'none',
                        borderLeft: !hasLeftNeighbor ? `2px solid ${outlineColor}` : 'none',
                        zIndex: 4
                      }}
                    />
                  );
                })
              )}

              {/* Čárkované čáry uvnitř */}
              {tile.pattern.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  if (!cell) return null;
                  
                  const cellX = tile.x + colIndex;
                  const cellY = tile.y + rowIndex;
                  
                  const hasRightNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'right');
                  const hasBottomNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'bottom');
                  
                  return (
                    <React.Fragment key={`${tile.id}-dashed-${rowIndex}-${colIndex}`}>
                      {/* Vertikální čárkovaná čára vpravo */}
                      {hasRightNeighbor && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: (cellX + 1) * cellSize - 1 + 16,
                            top: cellY * cellSize + cellSize * 0.25 + 16,
                            width: '2px',
                            height: cellSize * 0.5,
                            background: `repeating-linear-gradient(to bottom, ${outlineColor} 0px, ${outlineColor} 3px, transparent 3px, transparent 6px)`,
                            zIndex: 5
                          }}
                        />
                      )}
                      
                      {/* Horizontální čárkovaná čára dole */}
                      {hasBottomNeighbor && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: cellX * cellSize + cellSize * 0.25 + 16,
                            top: (cellY + 1) * cellSize - 1 + 16,
                            width: cellSize * 0.5,
                            height: '2px',
                            background: `repeating-linear-gradient(to right, ${outlineColor} 0px, ${outlineColor} 3px, transparent 3px, transparent 6px)`,
                            zIndex: 5
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </React.Fragment>
          );
        })}

        {/* Hover preview při drag&drop */}
        {draggedShape && hoverPosition && gamePhase === 'placing' && (
          <>
            {getTilePatternWithRotation(draggedShape.shapeId, draggedShape.rotation).map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                if (!cell) return null;
                
                const cellX = hoverPosition.x + colIndex;
                const cellY = hoverPosition.y + rowIndex;
                
                // Kontrola zda je buňka v bounds
                if (cellX < 0 || cellX >= gridWidth || cellY < 0 || cellY >= gridHeight) {
                  return null;
                }
                
                const baseColor = getTileColor(draggedShape.shapeId);
                const previewColor = canDrop 
                  ? `rgba(76, 175, 80, 0.7)` // Zelená pro platné
                  : `rgba(255, 77, 109, 0.7)`; // Červená pro neplatné
                
                return (
                  <div
                    key={`preview-${rowIndex}-${colIndex}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: cellX * cellSize + 1 + 16,
                      top: cellY * cellSize + 1 + 16,
                      width: cellSize - 2,
                      height: cellSize - 2,
                      backgroundColor: previewColor,
                      zIndex: 10,
                      border: canDrop ? '2px solid #4CAF50' : '2px solid #FF4D6D'
                    }}
                  >
                    {/* Křížek pro neplatné umístění */}
                    {!canDrop && (
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M5 5 L15 15 M15 5 L5 15"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}