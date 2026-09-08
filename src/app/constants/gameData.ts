export const COLORS = [
  '#ffffff', // bílá (pozadí)
  '#4CAF50', // zelená
  '#F2D602', // žlutá
  '#7E57C2', // fialová
  '#FF4D6D', // červená / růžová
  '#4EA3FF', // modrá
  '#B0B0B0', // šedá
  '#F7A800', // oranžová
  '#ffffff', // guma (bílá) - přidáno na konec
];

// Barvy pro design aplikace
export const APP_COLORS = {
  TASK_TEXT: '#9B1C1C', // tmavě červená pro číslo úkolu a nápis "DOKRESLI."
  PENCIL_ICON: '#000000', // černá pro ikonu tužky
  PAGE_BACKGROUND: '#FAF5DC', // světle béžová pro pozadí celé stránky
  GRID_BACKGROUND: '#FFFFFF', // bílá pro pozadí mřížky
  GRID_LINES: '#C0C4FF', // světle modrá pro čáry mřížky
  DIVIDER_LINE: '#A8A9FF', // středně světle modrá pro dělící čáru uprostřed
  BUTTON_BORDER: '#D0D4F0', // světlejší modrá pro bordery tlačítek
};

export interface RandomShape {
  gridSize: number;
  shape: Record<string, string>;
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Funkce pro náhodný výběr velikosti sítě podle obtížnosti - optimalizováno pro responsivitu
export const getRandomGridSize = (difficulty: Difficulty = Difficulty.EASY): number => {
  switch (difficulty) {
    case Difficulty.EASY:
      return Math.random() > 0.5 ? 10 : 12; // 10x10 nebo 12x12
    case Difficulty.MEDIUM:
      return Math.random() > 0.5 ? 12 : 14; // 12x12 nebo 14x14
    case Difficulty.HARD:
      return Math.random() > 0.5 ? 14 : 16; // 14x14 nebo 16x16
    default:
      return 10;
  }
};

// Funkce pro náhodný výběr barvy (kromě bílé a gumy)
export const getRandomColor = (): string => {
  // Vybereme barvy kromě první bílé a poslední gumy
  const coloredColors = COLORS.slice(1, -1);
  return coloredColors[Math.floor(Math.random() * coloredColors.length)];
};

// Funkce pro kontrolu, jestli je pozice volná (bez kolizí)
const isAreaFree = (startRow: number, startCol: number, width: number, height: number, usedPositions: Set<string>, gridSize: number, halfGrid: number): boolean => {
  // Zkontroluj, jestli se tvar vejde do mřížky
  if (startRow + height > gridSize || startCol + width > halfGrid) {
    return false;
  }
  
  // Zkontroluj kolize s existujícími tvary (včetně 1-políčkového bufferu)
  for (let r = Math.max(0, startRow - 1); r < Math.min(gridSize, startRow + height + 1); r++) {
    for (let c = Math.max(0, startCol - 1); c < Math.min(halfGrid, startCol + width + 1); c++) {
      if (usedPositions.has(`${r},${c}`)) {
        return false;
      }
    }
  }
  
  return true;
};

// Funkce pro generování různorodých tvarů na konkrétní pozici
export const generateShapeAt = (startRow: number, startCol: number, color: string, gridSize: number, shapeType: string): Record<string, string> => {
  const shape: Record<string, string> = {};
  const halfGrid = gridSize / 2;
  
  // Zajistíme, že se tvar nevejde mimo levou polovinu
  if (startCol >= halfGrid) return shape;
  
  const addCell = (r: number, c: number) => {
    const row = startRow + r;
    const col = startCol + c;
    if (row >= 0 && row < gridSize && col >= 0 && col < halfGrid) {
      shape[`${row},${col}`] = color;
    }
  };
  
  switch (shapeType) {
    case 'square_2x2':
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          addCell(r, c);
        }
      }
      break;
      
    case 'square_3x3':
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          addCell(r, c);
        }
      }
      break;
      
    case 'rectangle_vertical':
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          addCell(r, c);
        }
      }
      break;
      
    case 'rectangle_horizontal':
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          addCell(r, c);
        }
      }
      break;
      
    case 'line_vertical':
      for (let r = 0; r < 5; r++) {
        addCell(r, 0);
      }
      break;
      
    case 'line_horizontal':
      for (let c = 0; c < 4; c++) {
        addCell(0, c);
      }
      break;
      
    case 'line_diagonal':
      for (let i = 0; i < 4; i++) {
        addCell(i, i);
      }
      break;
      
    case 'L_shape':
      addCell(0, 0);
      addCell(1, 0);
      addCell(2, 0);
      addCell(2, 1);
      addCell(2, 2);
      break;
      
    case 'L_shape_rotated':
      addCell(0, 0);
      addCell(0, 1);
      addCell(0, 2);
      addCell(1, 0);
      addCell(2, 0);
      break;
      
    case 'T_shape':
      addCell(0, 0);
      addCell(0, 1);
      addCell(0, 2);
      addCell(1, 1);
      addCell(2, 1);
      break;
      
    case 'cross':
      addCell(1, 0);
      addCell(0, 1);
      addCell(1, 1);
      addCell(2, 1);
      addCell(1, 2);
      break;
      
    case 'diamond':
      addCell(0, 1);
      addCell(1, 0);
      addCell(1, 1);
      addCell(1, 2);
      addCell(2, 1);
      break;
      
    case 'triangle_up':
      addCell(2, 1);
      addCell(1, 0);
      addCell(1, 1);
      addCell(1, 2);
      addCell(0, 0);
      addCell(0, 1);
      addCell(0, 2);
      break;
      
    case 'triangle_right':
      addCell(0, 0);
      addCell(1, 0);
      addCell(1, 1);
      addCell(2, 0);
      addCell(2, 1);
      addCell(2, 2);
      break;
      
    case 'zigzag':
      addCell(0, 0);
      addCell(0, 1);
      addCell(1, 1);
      addCell(1, 2);
      addCell(2, 2);
      addCell(2, 3);
      break;
      
    case 'stairs':
      addCell(0, 0);
      addCell(1, 0);
      addCell(1, 1);
      addCell(2, 1);
      addCell(2, 2);
      addCell(3, 2);
      break;
      
    case 'arrow_up':
      addCell(0, 1);
      addCell(1, 0);
      addCell(1, 1);
      addCell(1, 2);
      addCell(2, 1);
      addCell(3, 1);
      break;
      
    case 'arrow_right':
      addCell(1, 0);
      addCell(1, 1);
      addCell(1, 2);
      addCell(0, 2);
      addCell(2, 2);
      break;
      
    case 'U_shape':
      addCell(0, 0);
      addCell(1, 0);
      addCell(2, 0);
      addCell(2, 1);
      addCell(2, 2);
      addCell(1, 2);
      addCell(0, 2);
      break;
      
    case 'checkmark':
      addCell(2, 0);
      addCell(1, 1);
      addCell(0, 2);
      addCell(0, 3);
      break;
      
    case 'heart':
      addCell(0, 1);
      addCell(0, 3);
      addCell(1, 0);
      addCell(1, 1);
      addCell(1, 2);
      addCell(1, 3);
      addCell(1, 4);
      addCell(2, 1);
      addCell(2, 2);
      addCell(2, 3);
      addCell(3, 2);
      break;
      
    case 'C_shape':
      addCell(0, 1);
      addCell(0, 2);
      addCell(1, 0);
      addCell(2, 0);
      addCell(3, 1);
      addCell(3, 2);
      break;
      
    case 'dot':
      addCell(0, 0);
      break;
      
    case 'dot_cluster':
      addCell(0, 0);
      addCell(0, 2);
      addCell(2, 0);
      addCell(2, 2);
      break;
  }
  
  return shape;
};

// Vylepšená funkce pro generování více objektů s lepším rozmístěním
export const generateMultipleObjects = (gridSize: number, difficulty: Difficulty): Record<string, string> => {
  const shape: Record<string, string> = {};
  const halfGrid = gridSize / 2;
  
  // Počet objektů podle obtížnosti - snížený pro lepší variety
  const objectCounts = {
    [Difficulty.EASY]: { min: 2, max: 4 },
    [Difficulty.MEDIUM]: { min: 3, max: 5 },
    [Difficulty.HARD]: { min: 4, max: 6 }
  };
  
  const { min, max } = objectCounts[difficulty];
  const numObjects = Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Typy tvarů podle obtížnosti - více různorodé
  const shapeTypes = {
    [Difficulty.EASY]: [
      'square_2x2', 'rectangle_vertical', 'rectangle_horizontal', 'dot', 
      'line_vertical', 'line_horizontal', 'cross', 'diamond', 'dot_cluster'
    ],
    [Difficulty.MEDIUM]: [
      'square_2x2', 'square_3x3', 'rectangle_vertical', 'rectangle_horizontal', 
      'L_shape', 'L_shape_rotated', 'T_shape', 'line_vertical', 'line_horizontal', 
      'line_diagonal', 'triangle_up', 'triangle_right', 'cross', 'diamond', 
      'arrow_up', 'arrow_right', 'checkmark'
    ],
    [Difficulty.HARD]: [
      'square_2x2', 'square_3x3', 'rectangle_vertical', 'rectangle_horizontal', 
      'L_shape', 'L_shape_rotated', 'T_shape', 'line_vertical', 'line_horizontal', 
      'line_diagonal', 'cross', 'diamond', 'triangle_up', 'triangle_right',
      'zigzag', 'stairs', 'arrow_up', 'arrow_right', 'U_shape', 'checkmark', 
      'heart', 'C_shape', 'dot_cluster'
    ]
  };
  
  const availableShapes = shapeTypes[difficulty];
  const usedPositions = new Set<string>();
  const usedColors = new Set<string>();
  
  // Rozdělíme levou polovinu na sektory pro lepší rozmístění
  const sectors = [
    { rowStart: 0, rowEnd: Math.floor(gridSize / 2), colStart: 0, colEnd: Math.floor(halfGrid / 2) }, // levý horní
    { rowStart: 0, rowEnd: Math.floor(gridSize / 2), colStart: Math.floor(halfGrid / 2), colEnd: halfGrid }, // pravý horní
    { rowStart: Math.floor(gridSize / 2), rowEnd: gridSize, colStart: 0, colEnd: Math.floor(halfGrid / 2) }, // levý dolní
    { rowStart: Math.floor(gridSize / 2), rowEnd: gridSize, colStart: Math.floor(halfGrid / 2), colEnd: halfGrid }, // pravý dolní
  ];
  
  let sectorIndex = 0;
  
  for (let i = 0; i < numObjects; i++) {
    let attempts = 0;
    let placed = false;
    
    while (!placed && attempts < 200) {
      // Vyberi sektor (rotuj mezi sektory pro lepší rozmístění)
      const sector = sectors[sectorIndex % sectors.length];
      
      // Náhodná pozice v daném sektoru
      const startRow = Math.floor(Math.random() * Math.max(1, sector.rowEnd - sector.rowStart - 5)) + sector.rowStart;
      const startCol = Math.floor(Math.random() * Math.max(1, sector.colEnd - sector.colStart - 5)) + sector.colStart;
      
      // Po několika neúspěšných pokusech zkus jiný sektor
      if (attempts > 50) {
        sectorIndex++;
      }
      
      // Náhodný tvar a barva
      const shapeType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      let color;
      
      // Snažíme se použít různé barvy
      if (usedColors.size < COLORS.length - 2) { // -2 kvůli bílé a gumě
        do {
          color = getRandomColor();
        } while (usedColors.has(color));
      } else {
        color = getRandomColor();
      }
      
      // Vygenerujeme tvar
      const newShape = generateShapeAt(startRow, startCol, color, gridSize, shapeType);
      
      // Zkontrolujeme kolize
      const hasCollision = Object.keys(newShape).some(pos => usedPositions.has(pos));
      
      if (!hasCollision && Object.keys(newShape).length > 0) {
        // Přidáme tvar
        Object.assign(shape, newShape);
        Object.keys(newShape).forEach(pos => usedPositions.add(pos));
        usedColors.add(color);
        placed = true;
        sectorIndex++; // Přejdi na další sektor
      }
      
      attempts++;
    }
  }
  
  return shape;
};

// Funkce pro generování náhodného tvaru podle obtížnosti
export const generateRandomShape = (gridSize: number, difficulty: Difficulty = Difficulty.EASY): Record<string, string> => {
  return generateMultipleObjects(gridSize, difficulty);
};

// Funkce pro generování kompletního náhodného levelu s obtížností
export const generateRandomLevel = (difficulty: Difficulty = Difficulty.EASY): RandomShape => {
  const gridSize = getRandomGridSize(difficulty);
  const shape = generateRandomShape(gridSize, difficulty);
  
  return {
    gridSize,
    shape
  };
};