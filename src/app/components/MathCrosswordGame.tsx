import React, { useState, useEffect, useCallback, useMemo } from 'react';

// === BARVY (podle designu z dokumentace) ===
const COLORS = {
  PAGE_BG: "#FAF5DC",      // světle béžová - hlavní pozadí stránky
  GRID_BG: "#FFFFFF",      // bílá - pozadí herní mřížky  
  GRID_LINE: "#C0C4FF",    // světle modrá - čáry mřížky
  BLUE: "#4EA3FF",         // modrá - zvýraznění vybrané buňky
  GREEN: "#4CAF50",        // zelená - úspěch, tlačítka
  RED: "#FF4D6D",          // červená - chyby
  YELLOW: "#F2D602",       // žlutá - akcentní barva
  TEXT: "#1F2937",         // tmavě šedá - běžný text
  CRIMSON: "#9B1C1C",      // tmavě červená - důležité texty
  PURPLE: "#8B5CF6",       // fialová - cílový rozdíl
  BLACK: "#000000",        // černá - progress bar
  LIGHT_PURPLE: "#E0E7FF", // světle fialová - pozadí progress baru
  BROWN: "#8B4513",        // hnědá - aktivní úroveň
  GRAY: "#B0B0B0",         // šedá - neaktivní prvky
  LIGHT_GREEN: "#E8F5E8",  // světle zelená - pozadí nalezených párů
};

// Barevný systém pro páry
const PAIR_COLORS = [
  { dark: "#4CAF50", light: "#E8F5E8" }, // Zelená
  { dark: "#7E57C2", light: "#E1D5F7" }, // Fialová  
  { dark: "#FF4D6D", light: "#FEE2E2" }, // Červená/růžová
  { dark: "#4EA3FF", light: "#E0F2FE" }, // Modrá
  { dark: "#F7A800", light: "#FEF3CD" }, // Oranžová
  { dark: "#8B4513", light: "#F3E8DC" }, // Hnědá
  { dark: "#DC2626", light: "#FEF2F2" }, // Tmavě červená
];

const getPairColor = (pairKey: string, foundPairs: Set<string>) => {
  const pairsArray = Array.from(foundPairs);
  const index = pairsArray.indexOf(pairKey);
  return PAIR_COLORS[index % PAIR_COLORS.length];
};

// TypeScript definice
type LevelKey = 1 | 2 | 3;

interface GameSpec {
  grid: { rows: number; cols: number };
  valueMin: number;
  valueMax: number;
  differenceMin: number;
  differenceMax: number;
  desiredPairs: number;
}

interface CellPos { 
  r: number;
  c: number;
}

interface Pair { 
  a: CellPos;
  b: CellPos;
}

interface GameSettings {
  level?: LevelKey;
  gridRows?: number;
  gridCols?: number;
  valueMin?: number;
  valueMax?: number;
  differenceMin?: number;
  differenceMax?: number;
  desiredPairs?: number;
  operationType?: 'addition' | 'subtraction';
  backgroundColor?: string;
}

interface MathCrosswordGameProps {
  settings?: GameSettings;
}

// Výchozí konfigurace úrovní
const DEFAULT_LEVELS: Record<LevelKey, GameSpec> = {
  1: { 
    grid: { rows: 3, cols: 3 },
    valueMin: 1, valueMax: 9,
    differenceMin: 1, differenceMax: 4,
    desiredPairs: 3
  },
  2: { 
    grid: { rows: 4, cols: 4 },
    valueMin: 0, valueMax: 8,
    differenceMin: 2, differenceMax: 6,
    desiredPairs: 4
  },
  3: { 
    grid: { rows: 5, cols: 5 },
    valueMin: 0, valueMax: 15,
    differenceMin: 3, differenceMax: 10,
    desiredPairs: 5
  },
};

// Utility funkce
const randint = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const key = (p: CellPos) => `${p.r}:${p.c}`;

const samePos = (p: CellPos, q: CellPos) => p.r === q.r && p.c === q.c;

const neighbors = (pos: CellPos, rows: number, cols: number): CellPos[] => {
  const out: CellPos[] = [];
  if (pos.r > 0) out.push({ r: pos.r - 1, c: pos.c });
  if (pos.r < rows - 1) out.push({ r: pos.r + 1, c: pos.c });
  if (pos.c > 0) out.push({ r: pos.r, c: pos.c - 1 });
  if (pos.c < cols - 1) out.push({ r: pos.r, c: pos.c + 1 });
  return out;
};

const edgeKey = (a: CellPos, b: CellPos) => {
  const ka = key(a); 
  const kb = key(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

// Algoritmus pro lepší distribuci čísel
const randintWithBetterDistribution = (
  min: number, 
  max: number, 
  existingCounts?: Map<number, number>
) => {
  if (!existingCounts) {
    return randint(min, max);
  }
  
  const candidates: number[] = [];
  for (let val = min; val <= max; val++) {
    candidates.push(val);
  }
  
  candidates.sort((a, b) => 
    (existingCounts.get(a) || 0) - (existingCounts.get(b) || 0)
  );
  
  const preferredCandidates = candidates.slice(
    0, Math.max(1, Math.ceil(candidates.length * 0.6))
  );
  
  if (Math.random() < 0.7) {
    return preferredCandidates[randint(0, preferredCandidates.length - 1)];
  } else {
    return randint(min, max);
  }
};

// Počítání disjunktních párů
function countDisjointPairs(grid: number[][], targetDifference: number, operationType: 'addition' | 'subtraction' = 'subtraction') {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const seen = new Set<string>();
  const pairs: Pair[] = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const here = { r, c };
      
      for (const nb of neighbors(here, rows, cols)) {
        if (nb.r < r || (nb.r === r && nb.c <= c)) continue;
        
        const value1 = grid[r][c];
        const value2 = grid[nb.r][nb.c];
        
        let isValidPair = false;
        if (operationType === 'subtraction') {
          isValidPair = Math.abs(value1 - value2) === targetDifference;
        } else { // addition
          isValidPair = (value1 + value2) === targetDifference;
        }
        
        if (!seen.has(key(here)) && 
            !seen.has(key(nb)) && 
            isValidPair) {
          
          pairs.push({ a: here, b: nb });
          seen.add(key(here));
          seen.add(key(nb));
        }
      }
    }
  }
  
  return { pairs };
}

// Generátor garantované mřížky - hlavní algoritmus
function generateGuaranteedGrid(spec: GameSpec, operationType: 'addition' | 'subtraction' = 'subtraction') {
  const { rows, cols } = spec.grid;
  const MAX_ATTEMPTS = 120;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Výběr cílového rozdílu
    const extraRange = Math.random() < 0.4;
    const minTarget = extraRange ? 
      Math.max(1, spec.differenceMin - 1) : spec.differenceMin;
    const maxTarget = extraRange ? 
      Math.min(spec.differenceMax + 2, spec.differenceMax + 1) : 
      spec.differenceMax;
    
    let targetDifference = randint(minTarget, maxTarget);

    // Výběr disjunktních hran
    const edges: Pair[] = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const here = { r, c };
        for (const nb of neighbors(here, rows, cols)) {
          if (nb.r > r || (nb.r === r && nb.c > c)) {
            edges.push({ a: here, b: nb });
          }
        }
      }
    }

    const shuffled = [...edges].sort(() => Math.random() - 0.5);
    const chosen: Pair[] = [];
    const used = new Set<string>();
    
    for (const e of shuffled) {
      if (chosen.length >= spec.desiredPairs) break;
      
      if (used.has(key(e.a)) || used.has(key(e.b))) continue;
      
      chosen.push(e);
      used.add(key(e.a));
      used.add(key(e.b));
    }
    
    if (chosen.length < spec.desiredPairs) continue;

    // Vytvoření prázdné mřížky
    const grid: number[][] = Array.from({ length: rows }, () => 
      Array(cols).fill(0)
    );

    // Naplnění vybraných párů
    const usedValues = new Set<number>();
    let allPairsPlaced = true;
    
    for (const e of chosen) {
      let placed = false;
      
      const possiblePairs: Array<{a: number, b: number}> = [];
      
      for (let aVal = spec.valueMin; aVal <= spec.valueMax; aVal++) {
        if (operationType === 'subtraction') {
          const bVal1 = aVal - targetDifference;
          const bVal2 = aVal + targetDifference;
          
          if (bVal1 >= spec.valueMin && bVal1 <= spec.valueMax) {
            possiblePairs.push({a: aVal, b: bVal1});
          }
          if (bVal2 >= spec.valueMin && bVal2 <= spec.valueMax && bVal2 !== bVal1) {
            possiblePairs.push({a: aVal, b: bVal2});
          }
        } else { // addition
          for (let bVal = spec.valueMin; bVal <= spec.valueMax; bVal++) {
            if (aVal + bVal === targetDifference) {
              possiblePairs.push({a: aVal, b: bVal});
            }
          }
        }
      }
      
      possiblePairs.sort((pair1, pair2) => {
        const score1 = (usedValues.has(pair1.a) ? 1 : 0) + 
                      (usedValues.has(pair1.b) ? 1 : 0);
        const score2 = (usedValues.has(pair2.a) ? 1 : 0) + 
                      (usedValues.has(pair2.b) ? 1 : 0);
        
        const randomFactor1 = Math.random() * 0.8;
        const randomFactor2 = Math.random() * 0.8;
        
        return (score1 + randomFactor1) - (score2 + randomFactor2);
      });
      
      for (let tries = 0; tries < possiblePairs.length && !placed; tries++) {
        const pair = possiblePairs[tries];
        grid[e.a.r][e.a.c] = pair.a;
        grid[e.b.r][e.b.c] = pair.b;
        usedValues.add(pair.a);
        usedValues.add(pair.b);
        placed = true;
      }
      
      if (!placed) {
        allPairsPlaced = false;
        break;
      }
    }
    
    if (!allPairsPlaced) continue;

    // Doplnění zbývajících buněk
    let ok = true;
    
    for (let r = 0; r < rows && ok; r++) {
      for (let c = 0; c < cols && ok; c++) {
        if (grid[r][c] !== 0) continue;
        
        const forbidden = new Set<number>();
        for (const nb of neighbors({ r, c }, rows, cols)) {
          const v = grid[nb.r][nb.c];
          if (v !== 0) {
            if (operationType === 'subtraction') {
              forbidden.add(v - targetDifference);
              forbidden.add(v + targetDifference);
            } else { // addition
              forbidden.add(targetDifference - v);
            }
          }
        }
        
        const counts = new Map<number, number>();
        for (let gr = 0; gr < rows; gr++) {
          for (let gc = 0; gc < cols; gc++) {
            const val = grid[gr][gc];
            if (val !== 0) {
              counts.set(val, (counts.get(val) || 0) + 1);
            }
          }
        }
        
        const candidates: number[] = [];
        for (let val = spec.valueMin; val <= spec.valueMax; val++) {
          if (!forbidden.has(val)) candidates.push(val);
        }
        
        if (candidates.length === 0) { 
          ok = false; 
          break; 
        }
        
        let selectedValue;
        const maxAttempts = 10;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          selectedValue = randintWithBetterDistribution(
            spec.valueMin, spec.valueMax, counts
          );
          if (candidates.includes(selectedValue)) {
            break;
          }
        }
        
        if (!candidates.includes(selectedValue!)) {
          selectedValue = candidates[randint(0, candidates.length - 1)];
        }
        
        grid[r][c] = selectedValue!;
      }
    }
    
    if (!ok) continue;

    // Finální validace
    const { pairs } = countDisjointPairs(grid, targetDifference, operationType);
    if (pairs.length >= spec.desiredPairs) {
      return { 
        grid, 
        targetDifference, 
        targetPairsCount: pairs.length 
      };
    }
  }

  // Fallback
  const grid: number[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => randint(spec.valueMin, spec.valueMax))
  );
  const targetDifference = randint(spec.differenceMin, spec.differenceMax);
  
  const { pairs } = countDisjointPairs(grid, targetDifference, operationType);
  return { grid, targetDifference, targetPairsCount: pairs.length };
}

export function MathCrosswordGame({ settings = {} }: MathCrosswordGameProps) {
  // Debug logging - zobrazení přijatých nastavení
  console.log('MathCrosswordGame received settings:', settings);
  console.log('MathCrosswordGame settings.level:', settings.level);
  console.log('MathCrosswordGame typeof settings.level:', typeof settings.level);

  // Aplikování nastavení s useMemo pro zabránění nekonečným re-renderům
  const gameSpec = useMemo(() => {
    const level = settings.level ?? 1;
    const defaultSpec = DEFAULT_LEVELS[level];
    
    console.log('MathCrosswordGame processing:', {
      receivedLevel: settings.level,
      finalLevel: level,
      defaultSpec,
      gridRows: settings.gridRows,
      gridCols: settings.gridCols
    });
    
    const spec = {
      grid: {
        rows: settings.gridRows ?? defaultSpec.grid.rows,
        cols: settings.gridCols ?? defaultSpec.grid.cols,
      },
      valueMin: settings.valueMin ?? defaultSpec.valueMin,
      valueMax: settings.valueMax ?? defaultSpec.valueMax,
      differenceMin: settings.differenceMin ?? defaultSpec.differenceMin,
      differenceMax: settings.differenceMax ?? defaultSpec.differenceMax,
      desiredPairs: settings.desiredPairs ?? defaultSpec.desiredPairs,
    };
    
    console.log('Final gameSpec:', spec);
    console.log('=== MATH CROSSWORD GAME SPEC DEBUG ===');
    console.log('Grid size:', spec.grid.rows, 'x', spec.grid.cols);
    console.log('Value range:', spec.valueMin, '-', spec.valueMax); 
    console.log('Difference range:', spec.differenceMin, '-', spec.differenceMax);
    console.log('Desired pairs:', spec.desiredPairs);
    console.log('=========================================');
    return spec;
  }, [
    settings.level,
    settings.gridRows, 
    settings.gridCols,
    settings.valueMin,
    settings.valueMax,
    settings.differenceMin,
    settings.differenceMax,
    settings.desiredPairs
  ]);

  // Aplikování dalších nastavení
  const operationType = useMemo(() => settings.operationType ?? 'subtraction', [settings.operationType]);
  const backgroundColor = useMemo(() => settings.backgroundColor ?? COLORS.PAGE_BG, [settings.backgroundColor]);

  // Získání úrovně pro UI
  const level = useMemo(() => settings.level ?? 1, [settings.level]);

  // State
  const [grid, setGrid] = useState<number[][]>([]);
  const [targetDifference, setTargetDifference] = useState<number>(0);
  const [targetPairsCount, setTargetPairsCount] = useState<number>(0);
  const [foundPairs, setFoundPairs] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<CellPos | null>(null);
  const [errors, setErrors] = useState<number>(0);
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Responsive design
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cellSize = useMemo(() => {
    if (windowSize.width === 0 || windowSize.height === 0) return 72;
    
    const availableHeight = windowSize.height * 0.85;
    const availableWidth = windowSize.width * 0.85;
    
    const isDesktop = windowSize.width >= 1024;
    const gridAreaWidth = isDesktop ? 
      availableWidth - 320 - 32 :
      availableWidth;
    
    const maxCellSizeByHeight = Math.floor(availableHeight / (gameSpec.grid.rows + 1));
    const maxCellSizeByWidth = Math.floor(gridAreaWidth / (gameSpec.grid.cols + 1));
    
    const calculatedSize = Math.min(maxCellSizeByHeight, maxCellSizeByWidth);
    return Math.max(60, Math.min(200, calculatedSize));
  }, [gameSpec.grid.rows, gameSpec.grid.cols, windowSize]);

  // Regenerace hry
  const regenerate = useCallback(() => {
    console.log("=== REGENERATING GAME ===");
    console.log("Using gameSpec:", gameSpec);
    console.log("Operation type:", operationType);
    console.log("Level setting:", settings.level);
    
    const out = generateGuaranteedGrid(gameSpec, operationType);
    
    console.log("Nová hra vygenerována:", out);
    console.log("Mřížka:", out.grid);
    console.log(`Cílový ${operationType === 'addition' ? 'součet' : 'rozdíl'}:`, out.targetDifference);
    console.log("Očekávané páry:", out.targetPairsCount);
    
    setGrid(out.grid);
    setTargetDifference(out.targetDifference);
    setTargetPairsCount(out.targetPairsCount);
    setFoundPairs(new Set());
    setSelected(null);
    setErrors(0);
    setShowVictory(false);
  }, [gameSpec, operationType]);

  // Inicializace při načtení
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  // Herní logika - klikání na buňky
  const handleCellClick = (pos: CellPos) => {
    if (!selected) { 
      setSelected(pos); 
      return; 
    }

    if (samePos(selected, pos)) { 
      setSelected(null); 
      return; 
    }

    const isNeighbor = neighbors(selected, gameSpec.grid.rows, gameSpec.grid.cols)
      .some(p => samePos(p, pos));
        
    if (!isNeighbor) { 
      setSelected(pos);
      setErrors(e => e + 1);
      return; 
    }

    const used = (p: CellPos) => Array.from(foundPairs)
      .some(ek => ek.split("|").includes(key(p)));
        
    if (used(selected) || used(pos)) { 
      setSelected(null); 
      setErrors(e => e + 1); 
      return; 
    }

    const value1 = grid[selected.r][selected.c];
    const value2 = grid[pos.r][pos.c];
    
    let isCorrect = false;
    if (operationType === 'subtraction') {
      isCorrect = Math.abs(value1 - value2) === targetDifference;
    } else { // addition
      isCorrect = (value1 + value2) === targetDifference;
    }
    
    if (isCorrect) {
      const newPairKey = edgeKey(selected, pos);
      setFoundPairs(prev => new Set(prev).add(newPairKey));
      setSelected(null);
    } else {
      setSelected(null);
      setErrors(e => e + 1);
    }
  };

  // Victory detection
  const done = targetPairsCount > 0 && foundPairs.size >= targetPairsCount;

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        setShowVictory(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowVictory(false);
    }
  }, [done]);

  return (
    <div className="w-full h-screen flex items-center justify-center p-2" 
         style={{ backgroundColor }}>
      <div className="w-full h-full max-w-none mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-center h-full w-full">
          {/* HERNÍ MŘÍŽKA */}
          <div className="flex flex-col justify-center items-center w-full h-full gap-6">
            {/* NADPIS NAD KŘÍŽOVKOU */}
            <div className="px-8 py-4" 
                 style={{}}>
              <div className="flex items-center justify-center gap-4">
                <h2 className="text-2xl font-bold" style={{ color: COLORS.CRIMSON }}>
                  {operationType === 'addition' ? 'Hledaný součet:' : 'Hledaný rozdíl:'}
                </h2>
                <div 
                  className="rounded-full flex items-center justify-center shadow-lg"
                  style={{ 
                    width: 64, height: 64, 
                    background: COLORS.PURPLE, 
                    color: "white",
                    fontSize: 28,
                    fontWeight: 'bold',
                    boxShadow: `0 6px 12px rgba(0,0,0,0.2)`
                  }}
                >
                  {targetDifference}
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl shadow-xl"
              style={{ 
                backgroundColor: COLORS.GRID_BG,
                width: 'fit-content',
                padding: Math.max(12, cellSize * 0.15)
              }}
            >
              <div 
                className="relative" 
                style={{ 
                  width: gameSpec.grid.cols * cellSize, 
                  height: gameSpec.grid.rows * cellSize
                }}
              >
                {/* SVG MŘÍŽKA */}
                <svg 
                  width={gameSpec.grid.cols * cellSize} 
                  height={gameSpec.grid.rows * cellSize} 
                  className="absolute inset-0"
                >
                  {/* Vertikální čáry */}
                  {Array.from({ length: gameSpec.grid.cols + 1 }).map((_, i) => (
                    <line 
                      key={`v-${i}`} 
                      x1={i * cellSize} y1={0} 
                      x2={i * cellSize} y2={gameSpec.grid.rows * cellSize} 
                      stroke={COLORS.GRID_LINE} 
                      strokeWidth={2} 
                    />
                  ))}
                  
                  {/* Horizontální čáry */}
                  {Array.from({ length: gameSpec.grid.rows + 1 }).map((_, i) => (
                    <line 
                      key={`h-${i}`} 
                      x1={0} y1={i * cellSize} 
                      x2={gameSpec.grid.cols * cellSize} y2={i * cellSize} 
                      stroke={COLORS.GRID_LINE} 
                      strokeWidth={2} 
                    />
                  ))}
                </svg>

                {/* VIZUÁLNÍ INDIKÁTORY PÁRŮ */}
                {Array.from(foundPairs).map((pairKey) => {
                  const [pos1Key, pos2Key] = pairKey.split("|");
                  const [r1, c1] = pos1Key.split(":").map(Number);
                  const [r2, c2] = pos2Key.split(":").map(Number);
                  const pairColor = getPairColor(pairKey, foundPairs);
                  
                  const centerX = (c1 + c2) * cellSize / 2 + cellSize / 2;
                  const centerY = (r1 + r2) * cellSize / 2 + cellSize / 2;
                  const symbolSize = Math.max(16, Math.min(32, cellSize * 0.3));
                  
                  return (
                    <div
                      key={pairKey}
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{
                        left: centerX - symbolSize/2,
                        top: centerY - symbolSize/2,
                        width: symbolSize,
                        height: symbolSize,
                        backgroundColor: pairColor.dark,
                        borderRadius: '50%',
                        color: 'white',
                        fontSize: Math.max(12, symbolSize * 0.6),
                        zIndex: 10
                      }}
                    >
                      −
                    </div>
                  );
                })}

                {/* HERNÍ BUŇKY */}
                {grid.map((row, r) => 
                  row.map((val, c) => {
                    const pos = { r, c };
                    const isSelected = selected && samePos(selected, pos);
                    const usedPairKey = Array.from(foundPairs)
                      .find(ek => ek.split("|").includes(key(pos)));
                    const used = !!usedPairKey;
                    const pairColor = usedPairKey ? getPairColor(usedPairKey, foundPairs) : null;
                    
                    return (
                      <button 
                        key={`${r}-${c}`} 
                        onClick={() => handleCellClick(pos)}
                        className="absolute flex items-center justify-center select-none transition-all"
                        style={{ 
                          left: c * cellSize,
                          top: r * cellSize,
                          width: cellSize, 
                          height: cellSize,
                          backgroundColor: used ? pairColor!.light : 
                                          (isSelected ? '#E3F2FD' : 'transparent'),
                          border: used ? `3px solid ${pairColor!.dark}` : 'none',
                          borderRadius: used ? '8px' : '0px'
                        }}
                      >
                        <span 
                          className="transition-colors"
                          style={{ 
                            color: used ? pairColor!.dark : 
                                  (isSelected ? COLORS.BLUE : COLORS.CRIMSON), 
                            fontSize: Math.max(18, Math.min(48, cellSize * 0.4))
                          }}
                        >
                          {val}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CONTROL PANEL */}  
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* NADPIS */}
            <h2 className="text-lg mb-6" style={{ color: COLORS.CRIMSON }}>
              Matematická křížovka - {operationType === 'addition' ? 'sčítání' : 'odčítání'}
            </h2>

            {/* PROGRESS INDIKÁTOR */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: COLORS.CRIMSON }}>Nalezeno párů:</span>
                <span style={{ color: COLORS.TEXT }}>
                  {targetPairsCount ? Math.round((foundPairs.size/targetPairsCount)*100) : 0}%
                </span>
              </div>
              
              <div 
                className="w-full h-4 rounded-full overflow-hidden"
                style={{ background: COLORS.LIGHT_PURPLE }}
              >
                <div 
                  className="h-full transition-all duration-300 ease-out" 
                  style={{ 
                    width: `${targetPairsCount ? (foundPairs.size/targetPairsCount)*100 : 0}%`, 
                    background: COLORS.BLACK 
                  }} 
                />
              </div>
              
              <div className="text-center mt-2 text-sm" style={{ color: COLORS.TEXT }}>
                {foundPairs.size} / {targetPairsCount} párů nalezeno
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {errors > 0 && (
              <div className="mb-4 p-3 rounded-lg" 
                   style={{ backgroundColor: '#FEF2F2', borderColor: COLORS.RED, border: '1px solid' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: COLORS.RED }}>⚠️</span>
                  <span className="text-sm" style={{ color: COLORS.RED }}>
                    Chyb: {errors} {errors === 1 ? 'pokus' : errors < 5 ? 'pokusy' : 'pokusů'}
                  </span>
                </div>
              </div>
            )}

            {/* AKČNÍ TLAČÍTKA */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={regenerate} 
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
                style={{ backgroundColor: COLORS.GREEN, color: 'white' }}
              >
                🔄 Nová hra
              </button>
              <button 
                onClick={() => { setFoundPairs(new Set()); setSelected(null); setErrors(0); }}
                className="w-full py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors bg-white"
                style={{ borderColor: COLORS.GRAY, color: COLORS.TEXT }}
              >
                🗑️ Vymazat páry
              </button>
            </div>

            {/* LEVEL DISPLAY */}

          </div>
        </div>
      </div>

      {/* VICTORY MODAL */}
      {showVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          <div 
            className="relative z-10 text-center p-8 rounded-3xl shadow-2xl bg-white border-4 max-w-md mx-4"
            style={{ borderColor: COLORS.GREEN }}
          >
            <h2 className="text-3xl mb-4" style={{ color: COLORS.GREEN }}>
              Hotovo! 🎉
            </h2>
            <p className="text-lg mb-6" style={{ color: COLORS.TEXT }}>
              Našel jsi všechny dvojice {operationType === 'addition' ? 'se součtem' : 's rozdílem'} <strong>{targetDifference}</strong>.
            </p>
            <button 
              onClick={() => {
                setShowVictory(false);
                regenerate();
              }} 
              className="px-8 py-3 rounded-xl text-white transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto" 
              style={{ backgroundColor: COLORS.GREEN }}
            >
              🔄 Nová hra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}