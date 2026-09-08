import { RandomShape, APP_COLORS } from '../constants/gameData';

export interface Cell {
  color: string;
  isCorrect?: boolean;
}

export const getExpectedMirrorCell = (row: number, col: number, level: RandomShape): string => {
  // Pro pravou polovinu najdeme odpovídající buňku v levé polovině
  const mirrorCol = level.gridSize - 1 - col;
  const key = `${row},${mirrorCol}`;
  return level.shape[key] || APP_COLORS.GRID_BACKGROUND;
};

export const evaluateGrid = (rightGrid: Record<string, Cell>, level: RandomShape): Record<string, Cell> => {
  const newRightGrid = { ...rightGrid };

  // Vyhodnocujeme pouze pravou polovinu mřížky
  for (let row = 0; row < level.gridSize; row++) {
    for (let col = Math.floor(level.gridSize / 2); col < level.gridSize; col++) {
      const key = `${row},${col}`;
      const expectedColor = getExpectedMirrorCell(row, col, level);
      const actualColor = newRightGrid[key]?.color || APP_COLORS.GRID_BACKGROUND;
      
      const isCorrect = expectedColor === actualColor;
      newRightGrid[key] = {
        color: actualColor,
        isCorrect: isCorrect
      };
    }
  }

  return newRightGrid;
};