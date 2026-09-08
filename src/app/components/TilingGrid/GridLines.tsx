import React from 'react';
import { TILING_COLORS } from '../../constants/tilingData';
import { GRID_CONSTANTS } from '../../constants/tilingGridConstants';

interface GridLinesProps {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
}

export function GridLines({ gridWidth, gridHeight, cellSize }: GridLinesProps) {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: `${GRID_CONSTANTS.PADDING}px`,
        top: `${GRID_CONSTANTS.PADDING}px`
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
  );
}