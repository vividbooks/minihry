// Utility funkce pro herní logiku zrcadlového kreslení

import { APP_COLORS } from '../constants/mirrorDrawingData';

// Interface pro buňku
export interface Cell {
  color: string;           // HEX barva buňky
  isCorrect?: boolean;     // true/false při vyhodnocení, undefined před vyhodnocením
}

// Interface pro náhodný tvar
export interface RandomShape {
  gridSize: number;
  shape: Record<string, string>; // mapování "row,col" -> barva
}

// Získání očekávané barvy pro zrcadlovou buňku
export const getExpectedMirrorCell = (row: number, col: number, level: RandomShape): string => {
  const { gridSize, shape } = level;
  const halfGrid = Math.floor(gridSize / 2);
  
  // Výpočet zrcadlové pozice v levé polovině
  const mirrorCol = halfGrid - 1 - (col - halfGrid);
  const mirrorKey = `${row},${mirrorCol}`;
  
  // Vrátíme barvu z levé poloviny nebo pozadí
  return shape[mirrorKey] || APP_COLORS.GRID_BACKGROUND;
};

// Vyhodnocení celé mřížky
export const evaluateGrid = (rightGrid: Record<string, Cell>, level: RandomShape): Record<string, Cell> => {
  const newRightGrid = { ...rightGrid };
  const { gridSize, gridHeight } = level;
  const actualHeight = gridHeight || gridSize;
  const halfGrid = Math.floor(gridSize / 2);
  
  // Procházíme každou buňku pravé poloviny
  for (let row = 0; row < actualHeight; row++) {
    for (let col = halfGrid; col < gridSize; col++) {
      const key = `${row},${col}`;
      
      // Najdeme očekávanou barvu z levé poloviny (zrcadlově)
      const expectedColor = getExpectedMirrorCell(row, col, level);
      
      // Získáme aktuální barvu (nebo pozadí)
      const actualColor = newRightGrid[key]?.color || APP_COLORS.GRID_BACKGROUND;
      
      // Vyhodnotíme správnost
      const isCorrect = expectedColor === actualColor;
      
      // Uložíme výsledek
      newRightGrid[key] = {
        color: actualColor,
        isCorrect: isCorrect
      };
    }
  }
  
  return newRightGrid;
};

// Kontrola dokončení
export const checkCompletion = (rightGrid: Record<string, Cell>): boolean => {
  const cells = Object.values(rightGrid);
  const correctCells = cells.filter(cell => cell.isCorrect === true).length;
  const totalCells = cells.length;
  return correctCells === totalCells && totalCells > 0;
};