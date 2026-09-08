import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  TilingLevel,
  PlacedTile,
  TILING_COLORS,
  TILE_SHAPES,
  getTilePatternWithRotation,
  canPlaceTile
} from '../../constants/tilingData';
import { GRID_CONSTANTS } from '../../constants/tilingGridConstants';
import { 
  calculateCellSize, 
  calculateDragPosition, 
  generateTileId 
} from '../../utils/tilingGridUtils';
import { TilingGridProps, HoverPosition } from './types';
import { GridLines } from './GridLines';
import { PlacedTiles } from './PlacedTiles';
import { HoverPreview } from './HoverPreview';

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

  // Dynamický výpočet velikosti buněk
  const cellSize = useMemo(() => 
    calculateCellSize(gridWidth, gridHeight), 
    [gridWidth, gridHeight]
  );

  // Získání barvy pro tile nebo preview
  const getTileColor = useCallback((shapeId: string) => {
    return level.colors?.[shapeId] || TILE_SHAPES[shapeId]?.color || '#4CAF50';
  }, [level.colors]);

  // Drag event handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!draggedShape || gamePhase !== 'placing') return;
    
    e.preventDefault();
    
    // Clear existing timeout
    if (invalidDropTimeout) {
      clearTimeout(invalidDropTimeout);
      setInvalidDropTimeout(null);
    }
    
    const position = calculateDragPosition(e, gridRef, cellSize);
    setHoverPosition(position);
    
    // Kontrola zda lze umístit
    const pattern = getTilePatternWithRotation(draggedShape.shapeId, draggedShape.rotation);
    const canPlace = canPlaceTile(pattern, position.x, position.y, gridWidth, gridHeight, placedTiles);
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
        // Neplatné umístění - nechat červený X na určitou dobu
        const timeout = setTimeout(() => {
          setHoverPosition(null);
          setCanDrop(false);
        }, GRID_CONSTANTS.TIMEOUTS.INVALID_DROP_DISPLAY);
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
      id: generateTileId(draggedShape.shapeId),
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
      const newTile: PlacedTile = {
        id: generateTileId(shapeId),
        shapeId,
        x,
        y,
        rotation,
        pattern,
        isPlaced: true
      };
      
      onTilePlace(newTile);
    }
  }, [gamePhase, gridWidth, gridHeight, placedTiles, onTilePlace]);

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

  return (
    <div className="flex justify-center items-center h-full p-4">
      <div
        ref={gridRef}
        data-tiling-grid="true"
        data-cell-size={cellSize}
        className="relative border-2 rounded-lg shadow-lg p-6"
        style={{
          backgroundColor: TILING_COLORS.GRID_BACKGROUND,
          borderColor: TILING_COLORS.PANEL_BORDER,
          width: gridWidth * cellSize + GRID_CONSTANTS.PADDING * 2,
          height: gridHeight * cellSize + GRID_CONSTANTS.PADDING * 2
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <GridLines 
          gridWidth={gridWidth} 
          gridHeight={gridHeight} 
          cellSize={cellSize} 
        />

        <PlacedTiles
          placedTiles={placedTiles}
          cellSize={cellSize}
          gamePhase={gamePhase}
          onTileRemove={onTileRemove}
          getTileColor={getTileColor}
        />

        <HoverPreview
          draggedShape={draggedShape}
          hoverPosition={hoverPosition}
          canDrop={canDrop}
          gamePhase={gamePhase}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          cellSize={cellSize}
          getTileColor={getTileColor}
        />
      </div>
    </div>
  );
}