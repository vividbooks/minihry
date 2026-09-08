// Konstanty pro hru dokreslovánízrcadlově shodných tvarů

// Paleta 7 barev pro kreslení bloků (+ 2 speciální)
export const COLORS = [
  '#ffffff', // [0] bílá - pozadí buněk (není v paletě)
  '#4CAF50', // [1] zelená - Material Design Green 500
  '#F2D602', // [2] žlutá - Custom bright yellow  
  '#7E57C2', // [3] fialová - Material Design Deep Purple 400
  '#FF4D6D', // [4] červená/růžová - Custom coral red
  '#4EA3FF', // [5] modrá - Custom bright blue
  '#B0B0B0', // [6] šedá - Neutral gray
  '#F7A800', // [7] oranžová - Custom amber orange
  '#ffffff', // [8] guma - bílá (stejná jako pozadí)
];

// UI barvy aplikace
export const APP_COLORS = {
  TASK_TEXT: '#9B1C1C',      // RGB(155, 28, 28) - tmavě červená
  PENCIL_ICON: '#000000',     // černá pro ikony
  PAGE_BACKGROUND: '#FAF5DC', // RGB(250, 245, 220) - světle béžová (beige)
  GRID_BACKGROUND: '#FFFFFF', // RGB(255, 255, 255) - čistě bílá
  GRID_LINES: '#C0C4FF',      // RGB(192, 196, 255) - světle modrá
  DIVIDER_LINE: '#A8A9FF',    // RGB(168, 169, 255) - středně světle modrá
  BUTTON_BORDER: '#D0D4F0',   // RGB(208, 212, 240) - světlejší modrá
};

// Dostupné barvy v paletě (bez pozadí)
export const DRAWING_COLORS = ['#4CAF50', '#F2D602', '#7E57C2', '#FF4D6D', '#4EA3FF', '#B0B0B0', '#F7A800'];

// Enum pro obtížnosti
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Interface pro náhodný tvar
export interface RandomShape {
  gridSize: number;
  gridHeight?: number; // Pro obdélníkové mřížky (EASY úroveň)
  shape: Record<string, string>; // mapování "row,col" -> barva
}

// Katalog všech tvarů podle kategorií
const BASIC_SHAPES = [
  'square_2x2',
  'rectangle_vertical', 
  'rectangle_horizontal',
  'dot',
  'line_vertical',
  'line_horizontal',
  'cross',
  'diamond',
  'dot_cluster'
];

const INTERMEDIATE_SHAPES = [
  'square_3x3',
  'L_shape',
  'L_shape_rotated',
  'T_shape',
  'line_diagonal',
  'triangle_up',
  'triangle_right',
  'arrow_up',
  'arrow_right',
  'checkmark'
];

const ADVANCED_SHAPES = [
  'zigzag',
  'stairs', 
  'U_shape',
  'heart',
  'C_shape'
];

// Kombinace tvarů podle obtížnosti
const SHAPES_BY_DIFFICULTY = {
  [Difficulty.EASY]: BASIC_SHAPES,
  [Difficulty.MEDIUM]: [...BASIC_SHAPES, ...INTERMEDIATE_SHAPES],
  [Difficulty.HARD]: [...BASIC_SHAPES, ...INTERMEDIATE_SHAPES, ...ADVANCED_SHAPES]
};

// Parametry generování podle obtížnosti
const GENERATION_PARAMETERS = {
  [Difficulty.EASY]: {
    gridSizes: [6], // Pouze 6x3 mřížka (3x3 vlevo + 3x3 vpravo)
    objectCount: { min: 5, max: 5 }, // Přesně 5 kostiček
    forceSmallGrid: true // Speciální flag pro malou mřížku
  },
  [Difficulty.MEDIUM]: {
    gridSizes: [10], // 10x5 mřížka (5x5 vlevo + 5x5 vpravo)
    objectCount: { min: 2, max: 4 }
  },
  [Difficulty.HARD]: {
    gridSizes: [14, 16],
    objectCount: { min: 4, max: 6 }
  }
};

// Generování tvaru na konkrétní pozici
export const generateShapeAt = (startRow: number, startCol: number, color: string, gridSize: number, shapeType: string, gridHeight?: number): Record<string, string> => {
  const shape: Record<string, string> = {};
  const halfGrid = Math.floor(gridSize / 2);
  const actualHeight = gridHeight || gridSize;
  
  const addCell = (r: number, c: number) => {
    const row = startRow + r;
    const col = startCol + c;
    if (row >= 0 && row < actualHeight && col >= 0 && col < halfGrid) {
      shape[`${row},${col}`] = color;
    }
  };

  switch (shapeType) {
    case 'square_2x2':
      addCell(0, 0); addCell(0, 1);
      addCell(1, 0); addCell(1, 1);
      break;
    case 'rectangle_vertical':
      addCell(0, 0); addCell(0, 1);
      addCell(1, 0); addCell(1, 1);
      addCell(2, 0); addCell(2, 1);
      addCell(3, 0); addCell(3, 1);
      break;
    case 'rectangle_horizontal':
      addCell(0, 0); addCell(0, 1); addCell(0, 2); addCell(0, 3);
      addCell(1, 0); addCell(1, 1); addCell(1, 2); addCell(1, 3);
      break;
    case 'dot':
      addCell(0, 0);
      break;
    case 'line_vertical':
      addCell(0, 0); addCell(1, 0); addCell(2, 0); addCell(3, 0); addCell(4, 0);
      break;
    case 'line_horizontal':
      addCell(0, 0); addCell(0, 1); addCell(0, 2); addCell(0, 3);
      break;
    case 'cross':
      addCell(1, 0);
      addCell(0, 1); addCell(1, 1); addCell(2, 1);
      addCell(1, 2);
      break;
    case 'diamond':
      addCell(0, 1);
      addCell(1, 0); addCell(1, 1); addCell(1, 2);
      addCell(2, 1);
      break;
    case 'dot_cluster':
      addCell(0, 0); addCell(0, 2);
      addCell(2, 0); addCell(2, 2);
      break;
    case 'square_3x3':
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          addCell(r, c);
        }
      }
      break;
    case 'L_shape':
      addCell(0, 0);
      addCell(1, 0);
      addCell(2, 0); addCell(2, 1); addCell(2, 2);
      break;
    case 'L_shape_rotated':
      addCell(0, 0); addCell(0, 1); addCell(0, 2);
      addCell(1, 0);
      addCell(2, 0);
      break;
    case 'T_shape':
      addCell(0, 0); addCell(0, 1); addCell(0, 2);
      addCell(1, 1);
      addCell(2, 1);
      break;
    case 'line_diagonal':
      addCell(0, 0);
      addCell(1, 1);
      addCell(2, 2);
      addCell(3, 3);
      break;
    case 'triangle_up':
      addCell(2, 1);
      addCell(1, 0); addCell(1, 1); addCell(1, 2);
      addCell(0, 0); addCell(0, 1); addCell(0, 2);
      break;
    case 'triangle_right':
      addCell(0, 0);
      addCell(1, 0); addCell(1, 1);
      addCell(2, 0); addCell(2, 1); addCell(2, 2);
      break;
    case 'arrow_up':
      addCell(0, 1);
      addCell(1, 0); addCell(1, 1); addCell(1, 2);
      addCell(2, 1);
      addCell(3, 1);
      break;
    case 'arrow_right':
      addCell(1, 0); addCell(1, 1); addCell(1, 2);
      addCell(0, 2);
      addCell(2, 2);
      break;
    case 'checkmark':
      addCell(2, 0);
      addCell(1, 1);
      addCell(0, 2); addCell(0, 3);
      break;
    case 'zigzag':
      addCell(0, 0); addCell(0, 1);
      addCell(1, 1); addCell(1, 2);
      addCell(2, 2); addCell(2, 3);
      break;
    case 'stairs':
      addCell(0, 0); addCell(1, 0);
      addCell(1, 1); addCell(2, 1);
      addCell(2, 2); addCell(3, 2);
      break;
    case 'U_shape':
      addCell(0, 0); addCell(1, 0); addCell(2, 0);
      addCell(2, 1); addCell(2, 2);
      addCell(1, 2); addCell(0, 2);
      break;
    case 'heart':
      addCell(0, 1); addCell(0, 3);
      addCell(1, 0); addCell(1, 1); addCell(1, 2); addCell(1, 3); addCell(1, 4);
      addCell(2, 1); addCell(2, 2); addCell(2, 3);
      addCell(3, 2);
      break;
    case 'C_shape':
      addCell(0, 1); addCell(0, 2);
      addCell(1, 0);
      addCell(2, 0);
      addCell(3, 1); addCell(3, 2);
      break;
  }

  return shape;
};

// Kontrola kolize s existujícími tvary
const checkCollision = (startRow: number, startCol: number, shapeType: string, gridSize: number, usedPositions: Set<string>, gridHeight?: number): boolean => {
  const testShape = generateShapeAt(startRow, startCol, '#000000', gridSize, shapeType, gridHeight);
  
  // Kontrola s buffer zónou 1 políčko
  for (const key in testShape) {
    const [row, col] = key.split(',').map(Number);
    
    // Kontrola samotné buňky a okolí
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const checkKey = `${row + dr},${col + dc}`;
        if (usedPositions.has(checkKey)) {
          return true; // Kolize!
        }
      }
    }
  }
  
  return false; // Žádná kolize
};

// Generování náhodného levelu
export const generateRandomLevel = (difficulty: Difficulty): RandomShape => {
  const params = GENERATION_PARAMETERS[difficulty];
  
  // Speciální handling pro EASY - malá 6x3 mřížka s jednotlivými kostičkami
  if (difficulty === Difficulty.EASY) {
    const gridSize = 6; // 6 sloupců celkem
    const gridHeight = 3; // 3 řádky
    const halfGrid = 3; // Levá polovina má 3 sloupce
    const shape: Record<string, string> = {};
    const availableColors = DRAWING_COLORS.slice();
    
    // Všechny možné pozice v levé polovině (3x3)
    const allPositions: Array<{row: number, col: number}> = [];
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < halfGrid; col++) {
        allPositions.push({ row, col });
      }
    }
    
    // Náhodně vybereme 5 pozic z 9 dostupných
    const shuffled = allPositions.sort(() => Math.random() - 0.5);
    const selectedPositions = shuffled.slice(0, 5);
    
    // Umístíme jednotlivé kostičky na vybrané pozice
    selectedPositions.forEach((pos, index) => {
      const color = availableColors[index % availableColors.length];
      shape[`${pos.row},${pos.col}`] = color;
    });
    
    return { gridSize, gridHeight, shape };
  }
  
  // Speciální handling pro MEDIUM - 10x5 mřížka (5x5 vlevo + 5x5 vpravo)
  if (difficulty === Difficulty.MEDIUM) {
    const gridSize = 10; // 10 sloupců celkem
    const gridHeight = 5; // 5 řádků
    const halfGrid = 5; // Levá polovina má 5 sloupců
    const shape: Record<string, string> = {};
    const availableColors = DRAWING_COLORS.slice();
    const objectCount = Math.floor(Math.random() * (params.objectCount.max - params.objectCount.min + 1)) + params.objectCount.min;
    
    // Používáme původní algoritmus ale s omezenou výškou
    const availableShapes = SHAPES_BY_DIFFICULTY[difficulty];
    const usedPositions = new Set<string>();
    
    // Upravené sektory pro 5x5 mřížku vlevo
    const sectors = [
      { rowStart: 0, rowEnd: 2, colStart: 0, colEnd: 2 },
      { rowStart: 0, rowEnd: 2, colStart: 3, colEnd: 5 },
      { rowStart: 3, rowEnd: 5, colStart: 0, colEnd: 2 },
      { rowStart: 3, rowEnd: 5, colStart: 3, colEnd: 5 }
    ];
    
    let currentSector = 0;
    
    for (let i = 0; i < objectCount; i++) {
      const shapeType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      const color = availableColors.length > 0 
        ? availableColors.splice(Math.floor(Math.random() * availableColors.length), 1)[0]
        : DRAWING_COLORS[Math.floor(Math.random() * DRAWING_COLORS.length)];
      
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200;
      
      while (!placed && attempts < maxAttempts) {
        const sector = sectors[currentSector];
        const startRow = Math.floor(Math.random() * (sector.rowEnd - sector.rowStart - 1)) + sector.rowStart;
        const startCol = Math.floor(Math.random() * (sector.colEnd - sector.colStart - 1)) + sector.colStart;
        
        if (!checkCollision(startRow, startCol, shapeType, gridSize, usedPositions, gridHeight)) {
          const newShape = generateShapeAt(startRow, startCol, color, gridSize, shapeType, gridHeight);
          
          // Kontrola, že tvar je pouze v levé polovině
          let validShape = true;
          for (const key in newShape) {
            const [row, col] = key.split(',').map(Number);
            if (col >= halfGrid || row >= gridHeight) {
              validShape = false;
              break;
            }
          }
          
          if (validShape) {
            // Přidání do hlavního tvaru
            Object.assign(shape, newShape);
            
            // Označení použitých pozic
            for (const key in newShape) {
              usedPositions.add(key);
            }
            
            placed = true;
          }
        }
        
        attempts++;
        
        // Po 50 pokusech přepnutí na další sektor
        if (attempts % 50 === 0) {
          currentSector = (currentSector + 1) % sectors.length;
        }
      }
    }
    
    return { gridSize, gridHeight, shape };
  }
  
  // Původní logika pro MEDIUM a HARD
  const availableShapes = SHAPES_BY_DIFFICULTY[difficulty];
  const availableColors = DRAWING_COLORS.slice(); // kopie pole
  
  // Náhodný výběr velikosti mřížky
  const gridSize = params.gridSizes[Math.floor(Math.random() * params.gridSizes.length)];
  const halfGrid = Math.floor(gridSize / 2);
  
  // Náhodný počet objektů
  const objectCount = Math.floor(Math.random() * (params.objectCount.max - params.objectCount.min + 1)) + params.objectCount.min;
  
  const shape: Record<string, string> = {};
  const usedPositions = new Set<string>();
  
  // Sektory pro rozložení
  const sectors = [
    { rowStart: 0, rowEnd: Math.floor(gridSize / 2), colStart: 0, colEnd: Math.floor(halfGrid / 2) },
    { rowStart: 0, rowEnd: Math.floor(gridSize / 2), colStart: Math.floor(halfGrid / 2), colEnd: halfGrid },
    { rowStart: Math.floor(gridSize / 2), rowEnd: gridSize, colStart: 0, colEnd: Math.floor(halfGrid / 2) },
    { rowStart: Math.floor(gridSize / 2), rowEnd: gridSize, colStart: Math.floor(halfGrid / 2), colEnd: halfGrid }
  ];
  
  let currentSector = 0;
  
  for (let i = 0; i < objectCount; i++) {
    const shapeType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    const color = availableColors.length > 0 
      ? availableColors.splice(Math.floor(Math.random() * availableColors.length), 1)[0]
      : DRAWING_COLORS[Math.floor(Math.random() * DRAWING_COLORS.length)];
    
    let placed = false;
    let attempts = 0;
    const maxAttempts = 200;
    
    while (!placed && attempts < maxAttempts) {
      const sector = sectors[currentSector];
      const startRow = Math.floor(Math.random() * (sector.rowEnd - sector.rowStart - 3)) + sector.rowStart;
      const startCol = Math.floor(Math.random() * (sector.colEnd - sector.colStart - 3)) + sector.colStart;
      
      if (!checkCollision(startRow, startCol, shapeType, gridSize, usedPositions)) {
        const newShape = generateShapeAt(startRow, startCol, color, gridSize, shapeType);
        
        // Přidání do hlavního tvaru
        Object.assign(shape, newShape);
        
        // Označení použitých pozic
        for (const key in newShape) {
          usedPositions.add(key);
        }
        
        placed = true;
      }
      
      attempts++;
      
      // Po 50 pokusech přepnutí na další sektor
      if (attempts % 50 === 0) {
        currentSector = (currentSector + 1) % sectors.length;
      }
    }
  }
  
  return { gridSize, shape };
};

// Získání názvu obtížnosti
export const getDifficultyName = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case Difficulty.EASY: return 'Snadná';
    case Difficulty.MEDIUM: return 'Střední';
    case Difficulty.HARD: return 'Těžká';
    default: return 'Snadná';
  }
};

// Získání ikony obtížnosti
export const getDifficultyIcon = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case Difficulty.EASY: return '⭐';
    case Difficulty.MEDIUM: return '⭐⭐';
    case Difficulty.HARD: return '⭐⭐⭐';
    default: return '⭐';
  }
};

// Kontrola, zda je barva guma
export const isEraser = (color: string): boolean => {
  return color === COLORS[COLORS.length - 1];
};