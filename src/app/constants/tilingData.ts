// =============================
// DLAŽDIČKOVÁ HRA - KONSTANTY A DATA
// =============================

export interface TileShape {
  id: string;
  name: string;
  pattern: boolean[][];
  color: string;
  emoji: string;
}

export interface PlacedTile {
  id: string;
  shapeId: string;
  x: number;
  y: number;
  rotation: number;
  pattern: boolean[][];
  isPlaced?: boolean;
}

export interface TilingLevel {
  id: number;
  name: string;
  gridSize: number;
  gridWidth?: number;
  gridHeight?: number;
  availableShapes: string[];
  targetCoverage: number;
  difficulty: number;
  colors?: Record<string, string>;
}

export interface GamePhase {
  phase: 'placing' | 'counting' | 'completed';
  userCounts: Record<string, number>;
  isCorrect?: boolean;
}

// =============================
// BAREVNÉ SCHÉMA
// =============================

export const TILING_COLORS = {
  PAGE_BACKGROUND: '#F5E6D0',    // Béžová jako ostatní hry
  GRID_BACKGROUND: '#FFFFFF',    // Čistě bílá
  GRID_LINES: '#C0C4FF',         // Světle modrá
  PANEL_BACKGROUND: '#FFFFFF',   // Bílá
  PANEL_BORDER: '#D0D4F0',       // Světlejší modrá
  TEXT_PRIMARY: '#4e5871',       // Tmavě modrošedá jako ostatní hry
  TEXT_SECONDARY: '#666666',     // Střední šedá
  BUTTON_PRIMARY: '#4EA3FF',     // Jasně modrá
  BUTTON_SUCCESS: '#4CAF50',     // Zelená
  HOVER_OVERLAY: 'rgba(78, 163, 255, 0.1)',
  VALID_DROP: 'rgba(76, 175, 80, 0.2)',
  INVALID_DROP: 'rgba(255, 77, 109, 0.2)',
};

// =============================
// ROBOTICKÉ BARVY PRO DLAŽDICE
// =============================

export const COLOR_PALETTE = [
  '#4CAF50', // Zelená
  '#F2D602', // Žlutá
  '#7E57C2', // Fialová
  '#FF4D6D', // Růžově červená
  '#4EA3FF', // Modrá
  '#B0B0B0', // Šedá
  '#F7A800', // Oranžová
];

// =============================
// DEFINICE TVARŮ DLAŽDIC
// =============================

export const TILE_SHAPES: Record<string, TileShape> = {
  square: {
    id: 'square',
    name: 'Čtverec',
    pattern: [[true]],
    color: '#4CAF50',
    emoji: '⬜'
  },
  rectangle2: {
    id: 'rectangle2',
    name: 'Obdélník 2',
    pattern: [[true, true]],
    color: '#F2D602',
    emoji: '▬'
  },
  rectangle3: {
    id: 'rectangle3',
    name: 'Obdélník 3',
    pattern: [[true, true, true]],
    color: '#7E57C2',
    emoji: '▬▬'
  },
  rectangle4: {
    id: 'rectangle4',
    name: 'Obdélník 4',
    pattern: [[true, true, true, true]],
    color: '#FF4D6D',
    emoji: '▬▬▬'
  },
  lShape: {
    id: 'lShape',
    name: 'L-tvar',
    pattern: [
      [true, false],
      [true, true]
    ],
    color: '#4EA3FF',
    emoji: '⅃'
  },
  lShapeBig: {
    id: 'lShapeBig',
    name: 'Velký L-tvar',
    pattern: [
      [true, false, false],
      [true, false, false],
      [true, true, true]
    ],
    color: '#B0B0B0',
    emoji: '⅃⅃'
  },
  tShape: {
    id: 'tShape',
    name: 'T-tvar',
    pattern: [
      [true, true, true],
      [false, true, false]
    ],
    color: '#F7A800',
    emoji: '⊤'
  },
  zShape: {
    id: 'zShape',
    name: 'Z-tvar',
    pattern: [
      [true, true, false],
      [false, true, true]
    ],
    color: '#4CAF50',
    emoji: '⌐'
  },
  squareBlock: {
    id: 'squareBlock',
    name: '2×2 Čtverec',
    pattern: [
      [true, true],
      [true, true]
    ],
    color: '#F2D602',
    emoji: '⬛'
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    pattern: [
      [false, true, false],
      [true, true, true],
      [false, true, false]
    ],
    color: '#7E57C2',
    emoji: '✚'
  },
  corner: {
    id: 'corner',
    name: 'Roh',
    pattern: [
      [true, true],
      [true, false]
    ],
    color: '#FF4D6D',
    emoji: '⌐'
  },
  uShape: {
    id: 'uShape',
    name: 'U-tvar',
    pattern: [
      [true, false, true],
      [true, true, true]
    ],
    color: '#4EA3FF',
    emoji: '⊔'
  },
};

// =============================
// SKUPINY TVARŮ PRO OBTÍŽNOST
// =============================

export const SHAPE_POOLS = {
  1: ['square', 'rectangle2', 'rectangle3', 'lShape'], // Začátečník - vždy square
  2: ['square', 'rectangle2', 'rectangle3', 'lShape', 'tShape', 'squareBlock'], // Pokročilý - vždy square
  3: ['square', 'lShape', 'lShapeBig', 'tShape', 'zShape', 'squareBlock', 'plus', 'corner', 'uShape'], // Expert - vždy square
};

// =============================
// ÚROVNĚ OBTÍŽNOSTI
// =============================

export const DEFAULT_LEVELS: TilingLevel[] = [
  {
    id: 1,
    name: 'Začátečník',
    gridSize: 3,
    gridWidth: 3,
    gridHeight: 3,
    availableShapes: ['square', 'rectangle2', 'lShape'], // Vždy obsahuje square
    targetCoverage: 100, // Dvorek musí být vyplněn na 100%
    difficulty: 1,
  },
  {
    id: 2,
    name: 'Pokročilý',
    gridSize: 4,
    gridWidth: 4,
    gridHeight: 4,
    availableShapes: ['square', 'rectangle2', 'rectangle3', 'lShape', 'tShape'], // Vždy obsahuje square
    targetCoverage: 100, // Dvorek musí být vyplněn na 100%
    difficulty: 2,
  },
  {
    id: 3,
    name: 'Expert',
    gridSize: 5,
    gridWidth: 5,
    gridHeight: 5,
    availableShapes: ['square', 'lShapeBig', 'tShape', 'zShape', 'plus', 'uShape'], // Vždy obsahuje square
    targetCoverage: 100, // Dvorek musí být vyplněn na 100%
    difficulty: 3,
  }
];

// =============================
// MOŽNÉ ROZMĚRY DVORKŮ
// =============================

export const GRID_SIZES = {
  1: [
    {width: 2, height: 2},
    {width: 3, height: 3},
    {width: 3, height: 4},
    {width: 4, height: 3},
  ],
  2: [
    {width: 4, height: 4},
    {width: 4, height: 5},
    {width: 5, height: 4},
    {width: 3, height: 6},
  ],
  3: [
    {width: 5, height: 5},
    {width: 4, height: 6},
    {width: 6, height: 4},
    {width: 5, height: 6},
    {width: 6, height: 5},
  ]
};

// =============================
// UTILITY FUNKCE
// =============================

/**
 * Ztmaví barvu o 40% pro outline
 */
export const getDarkerColor = (color: string): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const darkerR = Math.floor(r * 0.6);
  const darkerG = Math.floor(g * 0.6);
  const darkerB = Math.floor(b * 0.6);
  
  return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
};

/**
 * Rotuje pattern o 90° ve směru hodinových ručiček
 */
export const rotateTilePattern = (pattern: boolean[][]): boolean[][] => {
  const rows = pattern.length;
  const cols = pattern[0].length;
  const rotated: boolean[][] = [];
  
  for (let i = 0; i < cols; i++) {
    rotated[i] = [];
    for (let j = 0; j < rows; j++) {
      rotated[i][j] = pattern[rows - 1 - j][i];
    }
  }
  
  return rotated;
};

/**
 * Získá pattern tvaru s aplikovanou rotací
 */
export const getTilePatternWithRotation = (shapeId: string, rotation: number): boolean[][] => {
  let pattern = TILE_SHAPES[shapeId]?.pattern || [[true]];
  
  for (let i = 0; i < rotation; i++) {
    pattern = rotateTilePattern(pattern);
  }
  
  return pattern;
};

/**
 * Kontrola zda lze umístit dlaždici na pozici
 */
export const canPlaceTile = (
  pattern: boolean[][],
  x: number,
  y: number,
  gridWidth: number,
  gridHeight: number,
  placedTiles: PlacedTile[]
): boolean => {
  // Kontrola hranic
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col]) {
        const cellX = x + col;
        const cellY = y + row;
        
        if (cellX < 0 || cellX >= gridWidth || cellY < 0 || cellY >= gridHeight) {
          return false;
        }
      }
    }
  }
  
  // Kontrola kolizí s existujícími dlaždicemi
  const occupiedGrid: boolean[][] = [];
  for (let i = 0; i < gridHeight; i++) {
    occupiedGrid[i] = new Array(gridWidth).fill(false);
  }
  
  // Označení obsazených pozic
  placedTiles.forEach(tile => {
    tile.pattern.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const cellX = tile.x + colIndex;
          const cellY = tile.y + rowIndex;
          if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
            occupiedGrid[cellY][cellX] = true;
          }
        }
      });
    });
  });
  
  // Kontrola kolizí nové dlaždice
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col]) {
        const cellX = x + col;
        const cellY = y + row;
        
        if (occupiedGrid[cellY] && occupiedGrid[cellY][cellX]) {
          return false;
        }
      }
    }
  }
  
  return true;
};

/**
 * Vypočítá procento pokryté plochy
 */
export const calculateCoverage = (
  gridWidth: number,
  gridHeight: number,
  placedTiles: PlacedTile[]
): number => {
  const totalCells = gridWidth * gridHeight;
  const coveredGrid: boolean[][] = [];
  
  for (let i = 0; i < gridHeight; i++) {
    coveredGrid[i] = new Array(gridWidth).fill(false);
  }
  
  // Označení pokrytých pozic
  placedTiles.forEach(tile => {
    tile.pattern.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const cellX = tile.x + colIndex;
          const cellY = tile.y + rowIndex;
          if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
            coveredGrid[cellY][cellX] = true;
          }
        }
      });
    });
  });
  
  // Spočítání pokrytých buněk
  let coveredCells = 0;
  coveredGrid.forEach(row => {
    row.forEach(cell => {
      if (cell) coveredCells++;
    });
  });
  
  return (coveredCells / totalCells) * 100;
};

/**
 * Spočítá kolik dlaždic každého typu bylo použito
 */
export const countUsedShapes = (placedTiles: PlacedTile[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  placedTiles.forEach(tile => {
    counts[tile.shapeId] = (counts[tile.shapeId] || 0) + 1;
  });
  
  return counts;
};

/**
 * Vypočítá vzdálenost mezi dvěma barvami pro kontrast
 */
export const getColorDistance = (color1: string, color2: string): number => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
};

/**
 * Vygeneruje náhodné tvary podle obtížnosti
 * VŽDY zahrnuje 1×1 dlaždici (square) pro vyplnění mezer
 */
export const generateRandomShapes = (difficulty: number): string[] => {
  const pool = SHAPE_POOLS[difficulty as keyof typeof SHAPE_POOLS] || SHAPE_POOLS[1];
  const count = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  
  // Vždy začít s 1×1 dlaždici
  const shapes: string[] = ['square'];
  
  // Přidat další náhodné tvary (ale ne duplikáty square)
  const otherShapes = pool.filter(shape => shape !== 'square');
  const shuffled = [...otherShapes].sort(() => Math.random() - 0.5);
  const additionalShapes = shuffled.slice(0, count - 1);
  
  shapes.push(...additionalShapes);
  
  return shapes;
};

/**
 * Vygeneruje náhodné barvy s dostatečným kontrastem
 */
export const generateRandomColors = (shapeIds: string[]): Record<string, string> => {
  const colors: Record<string, string> = {};
  const usedColors: string[] = [];
  
  shapeIds.forEach(shapeId => {
    let bestColor = COLOR_PALETTE[0];
    let maxMinDistance = 0;
    
    COLOR_PALETTE.forEach(color => {
      if (usedColors.length === 0) {
        bestColor = color;
        return;
      }
      
      const minDistance = Math.min(...usedColors.map(usedColor => 
        getColorDistance(color, usedColor)
      ));
      
      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestColor = color;
      }
    });
    
    colors[shapeId] = bestColor;
    usedColors.push(bestColor);
  });
  
  return colors;
};

/**
 * Vygeneruje náhodnou velikost dvorku podle obtížnosti
 */
export const generateRandomGridSize = (difficulty: number): {width: number, height: number} => {
  const sizes = GRID_SIZES[difficulty as keyof typeof GRID_SIZES] || GRID_SIZES[1];
  const randomIndex = Math.floor(Math.random() * sizes.length);
  return sizes[randomIndex];
};

/**
 * Vygeneruje kompletní náhodný level
 * Dvorek musí být vždy vyplnitelný na 100%
 * Vždy obsahuje 1×1 dlaždici pro doplnění
 */
export const generateRandomLevel = (difficulty: number): TilingLevel => {
  const gridSize = generateRandomGridSize(difficulty);
  const shapes = generateRandomShapes(difficulty);
  const colors = generateRandomColors(shapes);
  
  return {
    id: Date.now(),
    name: `Náhodný dvorek ${difficulty}★`,
    gridSize: Math.max(gridSize.width, gridSize.height),
    gridWidth: gridSize.width,
    gridHeight: gridSize.height,
    availableShapes: shapes,
    targetCoverage: 100, // Vždy musí být vyplněn celý dvorek na 100%
    difficulty,
    colors,
  };
};

/**
 * Rozhraní pro props komponent
 */
export interface TilingGameProps {
  settings?: Record<string, any>;
}