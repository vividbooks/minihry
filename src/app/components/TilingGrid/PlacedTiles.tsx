import React from 'react';
import { PlacedTile, getDarkerColor } from '../../constants/tilingData';
import { GRID_CONSTANTS } from '../../constants/tilingGridConstants';
import { hasNeighbor, getPositionWithPadding } from '../../utils/tilingGridUtils';

interface PlacedTilesProps {
  placedTiles: PlacedTile[];
  cellSize: number;
  gamePhase: 'placing' | 'counting' | 'completed';
  onTileRemove: (tileId: string) => void;
  getTileColor: (shapeId: string) => string;
}

export function PlacedTiles({ 
  placedTiles, 
  cellSize, 
  gamePhase, 
  onTileRemove, 
  getTileColor 
}: PlacedTilesProps) {
  return (
    <>
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
                const position = getPositionWithPadding(cellX, cellY, cellSize, GRID_CONSTANTS.TILE_OFFSET.BACKGROUND);
                
                return (
                  <div
                    key={`${tile.id}-bg-${rowIndex}-${colIndex}`}
                    className="absolute cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      ...position,
                      width: cellSize - 2,
                      height: cellSize - 2,
                      backgroundColor: baseColor,
                      zIndex: GRID_CONSTANTS.Z_INDEX.TILE_BACKGROUND
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
                const position = getPositionWithPadding(cellX, cellY, cellSize);
                
                const hasTopNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'top');
                const hasRightNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'right');
                const hasBottomNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'bottom');
                const hasLeftNeighbor = hasNeighbor(tile, rowIndex, colIndex, 'left');
                
                return (
                  <div
                    key={`${tile.id}-border-${rowIndex}-${colIndex}`}
                    className="absolute pointer-events-none"
                    style={{
                      ...position,
                      width: cellSize,
                      height: cellSize,
                      borderTop: !hasTopNeighbor ? `${GRID_CONSTANTS.TILE_OFFSET.BORDER}px solid ${outlineColor}` : 'none',
                      borderRight: !hasRightNeighbor ? `${GRID_CONSTANTS.TILE_OFFSET.BORDER}px solid ${outlineColor}` : 'none',
                      borderBottom: !hasBottomNeighbor ? `${GRID_CONSTANTS.TILE_OFFSET.BORDER}px solid ${outlineColor}` : 'none',
                      borderLeft: !hasLeftNeighbor ? `${GRID_CONSTANTS.TILE_OFFSET.BORDER}px solid ${outlineColor}` : 'none',
                      zIndex: GRID_CONSTANTS.Z_INDEX.TILE_BORDER
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
                          left: (cellX + 1) * cellSize - 1 + GRID_CONSTANTS.PADDING,
                          top: cellY * cellSize + cellSize * GRID_CONSTANTS.DASHED_LINE.OFFSET_RATIO + GRID_CONSTANTS.PADDING,
                          width: `${GRID_CONSTANTS.DASHED_LINE.WIDTH}px`,
                          height: cellSize * GRID_CONSTANTS.DASHED_LINE.SIZE_RATIO,
                          background: `repeating-linear-gradient(to bottom, ${outlineColor} 0px, ${outlineColor} ${GRID_CONSTANTS.DASHED_LINE.LENGTH}px, transparent ${GRID_CONSTANTS.DASHED_LINE.LENGTH}px, transparent ${GRID_CONSTANTS.DASHED_LINE.LENGTH + GRID_CONSTANTS.DASHED_LINE.GAP}px)`,
                          zIndex: GRID_CONSTANTS.Z_INDEX.TILE_DASHED
                        }}
                      />
                    )}
                    
                    {/* Horizontální čárkovaná čára dole */}
                    {hasBottomNeighbor && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: cellX * cellSize + cellSize * GRID_CONSTANTS.DASHED_LINE.OFFSET_RATIO + GRID_CONSTANTS.PADDING,
                          top: (cellY + 1) * cellSize - 1 + GRID_CONSTANTS.PADDING,
                          width: cellSize * GRID_CONSTANTS.DASHED_LINE.SIZE_RATIO,
                          height: `${GRID_CONSTANTS.DASHED_LINE.WIDTH}px`,
                          background: `repeating-linear-gradient(to right, ${outlineColor} 0px, ${outlineColor} ${GRID_CONSTANTS.DASHED_LINE.LENGTH}px, transparent ${GRID_CONSTANTS.DASHED_LINE.LENGTH}px, transparent ${GRID_CONSTANTS.DASHED_LINE.LENGTH + GRID_CONSTANTS.DASHED_LINE.GAP}px)`,
                          zIndex: GRID_CONSTANTS.Z_INDEX.TILE_DASHED
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
    </>
  );
}