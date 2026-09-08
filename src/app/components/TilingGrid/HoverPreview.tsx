import React from 'react';
import { getTilePatternWithRotation } from '../../constants/tilingData';
import { GRID_CONSTANTS } from '../../constants/tilingGridConstants';
import { getPositionWithPadding } from '../../utils/tilingGridUtils';
import { HoverPosition } from './types';

interface HoverPreviewProps {
  draggedShape: { shapeId: string; rotation: number; colors: Record<string, string> } | null;
  hoverPosition: HoverPosition | null;
  canDrop: boolean;
  gamePhase: 'placing' | 'counting' | 'completed';
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  getTileColor: (shapeId: string) => string;
}

export function HoverPreview({
  draggedShape,
  hoverPosition,
  canDrop,
  gamePhase,
  gridWidth,
  gridHeight,
  cellSize,
  getTileColor
}: HoverPreviewProps) {
  if (!draggedShape || !hoverPosition || gamePhase !== 'placing') {
    return null;
  }

  return (
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
          
          const previewColor = canDrop 
            ? GRID_CONSTANTS.PREVIEW_COLORS.VALID
            : GRID_CONSTANTS.PREVIEW_COLORS.INVALID;
          
          const borderColor = canDrop 
            ? GRID_CONSTANTS.PREVIEW_COLORS.VALID_BORDER
            : GRID_CONSTANTS.PREVIEW_COLORS.INVALID_BORDER;
          
          const position = getPositionWithPadding(cellX, cellY, cellSize, GRID_CONSTANTS.TILE_OFFSET.BACKGROUND);
          
          return (
            <div
              key={`preview-${rowIndex}-${colIndex}`}
              className="absolute pointer-events-none"
              style={{
                ...position,
                width: cellSize - 2,
                height: cellSize - 2,
                backgroundColor: previewColor,
                zIndex: GRID_CONSTANTS.Z_INDEX.HOVER_PREVIEW,
                border: `${GRID_CONSTANTS.TILE_OFFSET.BORDER}px solid ${borderColor}`
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
  );
}