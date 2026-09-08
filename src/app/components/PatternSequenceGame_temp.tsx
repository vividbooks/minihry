// SOUBOR PRO SMAZÁNÍ
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice, ScreenSize, updateScreenSize } from '../utils/deviceDetection';

// Robotické barevné schéma podle dokumentace
const COLORS = {
  PAGE_BG: "#FAF5DC",        // Světle béžová
  SLOT_BG: "#FFFFFF",        // Bílé sloty
  SLOT_LINE: "#C0C4FF",      // Světle modrá ohraničení
  DRAGGABLE_BG: "#F0F9FF",   // Světle modrá pro drag prvky
  DRAGGABLE_BORDER: "#4EA3FF", // Modrá border
  HOVER_BG: "#FEF3CD",       // Žlutá hover
  SUCCESS_BG: "#4CAF50",     // Zelená úspěch
  CRIMSON: "#9B1C1C",        // Tmavě červená text
  BLUE: "#4EA3FF",           // Modrá tlačítka
  GREEN: "#4CAF50",          // Zelená progress
  PURPLE: "#7E57C2",         // Fialová accent
  RED: "#FF4D6D",            // Červená chyby
  ORANGE: "#F7A800",         // Oranžová reset
  GRAY: "#B0B0B0",           // Šedá neaktivní
  FILLED_BG: "#E8F5E8",      // Světle zelená vyplněné
  FILLED_BORDER: "#4CAF50"   // Zelená border vyplněné
};

// Typy a rozhraní
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface PatternElement {
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  id: string;
}

interface Position {
  x: number;
  y: number;
  rotation: number;
}

interface PatternSpec {
  pattern: PatternElement[][];
  missing: Array<{row: number, col: number}>;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
}

interface GameSettings {
  difficulty?: DifficultyLevel;
  patternTypes?: string[];
  shapes?: string[];
  colorGroups?: string[];
  patternLength?: [number, number];
  missingElements?: [number, number];
  customPatterns?: string;
}

interface PatternSequenceGameProps {
  settings?: GameSettings;
  onSwitchGame?: () => void;
}

// Geometrické tvary a barvy podle dokumentace
const SHAPES = ['circle', 'square', 'triangle'];

// 12 barev organizovaných do skupin podle dokumentace
const COLOR_GROUPS = {
  reds: ['#85324C', '#FF144D', '#FF4D6D'],      // Červená skupina
  oranges: ['#FF7B00', '#FF764A', '#F7A800'],   // Oranžová skupina  
  yellows: ['#FFD700'],                         // Žlutá skupina
  greens: ['#00E46C', '#007B5C', '#4CAF50'],    // Zelená skupina
  blues: ['#3FA9FF', '#0077FF', '#002DFF'],     // Modrá skupina
  purples: ['#6736FF', '#7E57C2', '#02006F']    // Fialová skupina
};

const SHAPE_COLORS = [
  '#85324C', '#FF144D', '#FF7B00', '#FF764A', '#FFD700', '#00E46C',
  '#007B5C', '#3FA9FF', '#0077FF', '#002DFF', '#6736FF', '#02006F'
];

// Konfigurační vzory pro různé obtížnosti podle dokumentace
const PATTERN_CONFIGS = {
  easy: [
    { 
      type: 'AB', 
      title: 'Střídavý vzor (AB)',
      description: 'Dva prvky se střídají',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    },
    {
      type: 'AAB',
      title: 'Dvojitý vzor (AAB)', 
      description: 'Dva stejné, pak jeden jiný',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AAB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    },
    {
      type: 'ABC',
      title: 'Trojitý vzor (ABC)',
      description: 'Tři různé prvky',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'ABC',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[2] || shapes[0], color: colors[2] || colors[0] }
        ]
      })
    },
    {
      type: 'AAAB',
      title: 'Trojitý první vzor (AAAB)',
      description: 'Tři stejné, pak jeden jiný',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AAAB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    }
  ],
  medium: [
    {
      type: 'AABB',
      title: 'Párový vzor (AABB)',
      description: 'Dva páry prvků',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AABB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    },
    {
      type: 'ABCD',
      title: 'Čtyřitý vzor (ABCD)',
      description: 'Čtyři různé prvky',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'ABCD',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[2] || shapes[0], color: colors[2] || colors[0] },
          { shape: shapes[0], color: colors[1] } // Mix tvarů a barev pro komplexnost
        ]
      })
    }
  ],
  hard: [
    {
      type: 'ABAC',
      title: 'Složený vzor (ABAC)',
      description: 'Komplexní opakování',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'ABAC',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[2] || shapes[1], color: colors[2] || colors[1] }
        ]
      })
    }
  ]
};

// Inteligentní výběr barev podle dokumentace
const selectDiverseColors = (count: number): number[] => {
  const colorGroupKeys = Object.keys(COLOR_GROUPS);
  const selectedColors: number[] = [];
  const usedGroups = new Set<string>();
  
  // Nejprve vybere z různých skupin
  while (selectedColors.length < count && usedGroups.size < colorGroupKeys.length) {
    for (const groupKey of colorGroupKeys) {
      if (usedGroups.has(groupKey) || selectedColors.length >= count) continue;
      
      const groupColors = COLOR_GROUPS[groupKey as keyof typeof COLOR_GROUPS];
      const randomColorFromGroup = groupColors[Math.floor(Math.random() * groupColors.length)];
      const colorIndex = SHAPE_COLORS.findIndex(color => color === randomColorFromGroup);
      
      if (colorIndex !== -1 && !selectedColors.includes(colorIndex)) {
        selectedColors.push(colorIndex);
        usedGroups.add(groupKey);
      }
    }
  }
  
  // Doplnění dalších barev pokud je třeba
  while (selectedColors.length < count) {
    const randomIndex = Math.floor(Math.random() * SHAPE_COLORS.length);
    if (!selectedColors.includes(randomIndex)) {
      selectedColors.push(randomIndex);
    }
  }
  
  return selectedColors.slice(0, count);
};

// Shape Component
interface ShapeComponentProps {
  element: PatternElement;
  size: number;
}

const ShapeComponent: React.FC<ShapeComponentProps> = ({ element, size }) => {
  const renderShape = () => {
    const shapeProps = {
      width: size,
      height: size,
      fill: element.color,
      stroke: 'none',
      strokeWidth: 0
    };
    
    switch (element.shape) {
      case 'circle':
        return <circle cx={size/2} cy={size/2} r={size/2 - 2} {...shapeProps} />;
      case 'square':
        return <rect x={2} y={2} width={size-4} height={size-4} {...shapeProps} />;
      case 'triangle':
        return <polygon points={`${size/2},2 2,${size-2} ${size-2},${size-2}`} {...shapeProps} />;
      default:
        return <circle cx={size/2} cy={size/2} r={size/2 - 2} {...shapeProps} />;
    }
  };

  return (
    <svg width={size} height={size}>
      {renderShape()}
    </svg>
  );
};

// Draggable Pattern Component
interface DraggablePatternProps {
  element: PatternElement;
  originalIndex: number;
  onDrop: () => void;
  style: React.CSSProperties;
  size: number;
}

const DraggablePattern: React.FC<DraggablePatternProps> = ({ element, originalIndex, onDrop, style, size }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'pattern',
    item: { element: {...element}, originalIndex },
    end: (item, monitor) => {
      if (monitor.didDrop()) onDrop();
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [element, originalIndex]);
  
  const containerSize = Math.floor(size * 1.8);
  
  return (
    <div 
      ref={drag} 
      className="cursor-move select-none transition-all transform active:scale-95 absolute z-30 flex items-center justify-center" 
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: COLORS.DRAGGABLE_BG,
        border: `3px solid ${COLORS.DRAGGABLE_BORDER}`,
        borderRadius: '16px',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        ...style
      }}
    >
      <ShapeComponent element={element} size={size} />
    </div>
  );
};

// Drop Slot Component
interface DropSlotProps {
  slotKey: string;
  element: PatternElement | null;
  expectedElement: PatternElement;
  onDrop: (slotKey: string, element: PatternElement, originalIndex: number) => void;
  onRemove: (slotKey: string) => void;
  size: number;
  isComplete: boolean;
}

const DropSlot: React.FC<DropSlotProps> = ({ slotKey, element, expectedElement, onDrop, onRemove, size, isComplete }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'pattern',
    drop: (item: { element: PatternElement; originalIndex: number }) => {
      onDrop(slotKey, item.element, item.originalIndex);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));
  
  const isEmpty = element === null;
  const isCorrect = element && expectedElement && 
    element.shape === expectedElement.shape && 
    element.color === expectedElement.color;
  
  // Symboly se označí zeleně pouze po dokončení hry
  const showCorrect = isCorrect && isComplete;
  const showIncorrect = !isEmpty && !isCorrect;
  
  const backgroundColor = isEmpty ? 
    (isOver ? COLORS.HOVER_BG : COLORS.SLOT_BG) : 
    (showCorrect ? COLORS.FILLED_BG : showIncorrect ? '#FFE4E1' : COLORS.SLOT_BG);
  
  const border = isEmpty ? 
    `3px dashed ${COLORS.SLOT_LINE}` : 
    (showCorrect ? `3px solid ${COLORS.FILLED_BORDER}` : 
     showIncorrect ? `3px solid ${COLORS.RED}` : 
     `3px solid ${COLORS.SLOT_LINE}`);
  
  return (
    <div
      ref={drop}
      className="flex items-center justify-center transition-all cursor-pointer"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        border,
        borderRadius: '12px',
        boxShadow: isEmpty ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onClick={() => {
        if (element) {
          onRemove(slotKey);
        }
      }}
    >
      {element ? (
        <ShapeComponent element={element} size={Math.floor(size * 0.8)} />
      ) : (
        <span style={{ color: COLORS.GRAY, fontSize: `${Math.floor(size * 0.3)}px` }}>?</span>
      )}
    </div>
  );
};

// Parsování vlastních vzorů
const parseCustomPattern = (patternString: string): { pattern: string; elements: any[] } | null => {
  if (!patternString.trim()) return null;
  
  const pattern = patternString.trim().toUpperCase();
  const uniqueChars = [...new Set(pattern.split(''))];
  
  if (uniqueChars.length > 3) {
    console.warn('Vlastní vzor může mít maximálně 3 různé znaky');
    return null;
  }
  
  const selectedShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, uniqueChars.length);
  const selectedColors = selectDiverseColors(uniqueChars.length);
  
  const elements = uniqueChars.map((char, index) => ({
    shape: selectedShapes[index],
    color: selectedColors[index]
  }));
  
  return { pattern, elements };
};

// Generování vzoru podle obtížnosti
const generatePatternVariant = (difficulty: DifficultyLevel = 'easy', customPatterns: string = '', patternTypes: string[] = []): PatternSpec => {
  try {
    // Pokud jsou zadány vlastní vzory, použij je
    if (customPatterns) {
      const patterns = customPatterns.split(',').map(p => p.trim()).filter(p => p);
      if (patterns.length > 0) {
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        const parsed = parseCustomPattern(randomPattern);
        
        if (parsed) {
          const { pattern, elements } = parsed;
          
          // Určení délky podle obtížnosti
          let totalLength: number;
          switch (difficulty) {
            case 'easy':
              totalLength = 12 + Math.floor(Math.random() * 5); // 12-16
              break;
            case 'medium':
            case 'hard':
              totalLength = 16 + Math.floor(Math.random() * 5); // 16-20
              break;
          }
          
          // Vytvoření vzoru
          const generatedPattern: PatternElement[][] = [];
          
          if (difficulty === 'easy') {
            // Jeden řádek pro easy
            const row: PatternElement[] = [];
            for (let i = 0; i < totalLength; i++) {
              const charIndex = i % pattern.length;
              const char = pattern[charIndex];
              const elementIndex = [...new Set(pattern.split(''))].indexOf(char);
              const baseElement = elements[elementIndex];
              
              row.push({
                id: `${i}-${Math.random().toString(36).substr(2, 9)}`,
                shape: baseElement.shape as 'circle' | 'square' | 'triangle',
                color: SHAPE_COLORS[baseElement.color]
              });
            }
            generatedPattern.push(row);
          } else {
            // Dva řádky pro medium/hard
            const row1: PatternElement[] = [];
            const row2: PatternElement[] = [];
            
            for (let i = 0; i < Math.ceil(totalLength / 2); i++) {
              const charIndex1 = i % pattern.length;
              const char1 = pattern[charIndex1];
              const elementIndex1 = [...new Set(pattern.split(''))].indexOf(char1);
              const baseElement1 = elements[elementIndex1];
              
              row1.push({
                id: `0-${i}-${Math.random().toString(36).substr(2, 9)}`,
                shape: baseElement1.shape as 'circle' | 'square' | 'triangle',
                color: SHAPE_COLORS[baseElement1.color]
              });
              
              if (i < Math.floor(totalLength / 2)) {
                const charIndex2 = difficulty === 'medium' ? 
                  (i + 1) % pattern.length : // Posunutý vzor
                  (pattern.length - 1 - (i % pattern.length)); // Zrcadlový vzor
                const char2 = pattern[charIndex2];
                const elementIndex2 = [...new Set(pattern.split(''))].indexOf(char2);
                const baseElement2 = elements[elementIndex2];
                
                row2.push({
                  id: `1-${i}-${Math.random().toString(36).substr(2, 9)}`,
                  shape: baseElement2.shape as 'circle' | 'square' | 'triangle',
                  color: SHAPE_COLORS[baseElement2.color]
                });
              }
            }
            
            generatedPattern.push(row1, row2);
          }
          
          // Chytrá logika chybějících prvků
          const missing: Array<{row: number, col: number}> = [];
          
          if (difficulty === 'easy') {
            const row = generatedPattern[0];
            const patternUnit = pattern.length;
            
            const visibleStart = Math.min(patternUnit + 1, row.length - 6);
            const visibleEnd = Math.max(row.length - 3, visibleStart + 6);
            
            for (let i = visibleStart; i < visibleEnd; i++) {
              const positionInUnit = i % patternUnit;
              if (positionInUnit === 1 || (patternUnit > 3 && positionInUnit === 3)) {
                missing.push({ row: 0, col: i });
              }
            }
            
            while (missing.length < 4 && missing.length < row.length - 4) {
              const randomIndex = visibleStart + Math.floor(Math.random() * (visibleEnd - visibleStart));
              if (!missing.some(pos => pos.col === randomIndex)) {
                missing.push({ row: 0, col: randomIndex });
              }
            }
          } else {
            const totalElements = generatedPattern.reduce((sum, row) => sum + row.length, 0);
            const missingCount = Math.min(6 + Math.floor(Math.random() * 3), Math.floor(totalElements * 0.4));
            
            while (missing.length < missingCount) {
              const row = Math.floor(Math.random() * generatedPattern.length);
              const col = Math.floor(Math.random() * generatedPattern[row].length);
              
              if (!missing.some(pos => pos.row === row && pos.col === col)) {
                missing.push({ row, col });
              }
            }
          }
          
          return {
            pattern: generatedPattern,
            missing,
            title: `Vlastní vzor: ${randomPattern}`,
            description: `Doplň chybějící prvky ve vzoru ${randomPattern}`,
            difficulty
          };
        }
      }
    }
    
    // Standardní generování pokud nejsou vlastní vzory
    let patterns = PATTERN_CONFIGS[difficulty];
    
    // Aplikace filtru podle nastavení patternTypes
    if (patternTypes && patternTypes.length > 0) {
      const availablePatterns: any[] = [];
      
      // Projde všechny obtížnosti a najde vzory odpovídající nastavení
      Object.entries(PATTERN_CONFIGS).forEach(([difficultyLevel, difficultyPatterns]) => {
        difficultyPatterns.forEach(pattern => {
          if (patternTypes.includes(pattern.type)) {
            availablePatterns.push(pattern);
          }
        });
      });
      
      // Pokud jsou k dispozici vzory odpovídající nastavení, použij je
      if (availablePatterns.length > 0) {
        patterns = availablePatterns;
      }
    }
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Výběr tvarů a barev
    const selectedShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, 3);
    const selectedColors = selectDiverseColors(3);
    
    const { pattern, elements } = selectedPattern.generate(selectedShapes, selectedColors);
    
    // Určení délky podle obtížnosti
    let totalLength: number;
    switch (difficulty) {
      case 'easy':
        totalLength = 12 + Math.floor(Math.random() * 5); // 12-16
        break;
      case 'medium':
      case 'hard':
        totalLength = 16 + Math.floor(Math.random() * 5); // 16-20
        break;
    }
    
    // Vytvoření vzoru
    const generatedPattern: PatternElement[][] = [];
    
    if (difficulty === 'easy') {
      // Jeden řádek pro easy
      const row: PatternElement[] = [];
      for (let i = 0; i < totalLength; i++) {
        const baseElement = elements[i % elements.length];
        row.push({
          id: `${i}-${Math.random().toString(36).substr(2, 9)}`,
          shape: baseElement.shape as 'circle' | 'square' | 'triangle',
          color: SHAPE_COLORS[baseElement.color]
        });
      }
      generatedPattern.push(row);
    } else {
      // Dva řádky pro medium/hard
      const row1: PatternElement[] = [];
      const row2: PatternElement[] = [];
      
      for (let i = 0; i < Math.ceil(totalLength / 2); i++) {
        const baseElement1 = elements[i % elements.length];
        row1.push({
          id: `0-${i}-${Math.random().toString(36).substr(2, 9)}`,
          shape: baseElement1.shape as 'circle' | 'square' | 'triangle',
          color: SHAPE_COLORS[baseElement1.color]
        });
        
        // Pro druhý řádek jiná logika podle obtížnosti
        const baseElement2 = difficulty === 'medium' ? 
          elements[(i + 1) % elements.length] : // Posunutý vzor
          elements[(elements.length - 1 - (i % elements.length))] // Zrcadlový vzor
        
        if (i < Math.floor(totalLength / 2)) {
          row2.push({
            id: `1-${i}-${Math.random().toString(36).substr(2, 9)}`,
            shape: baseElement2.shape as 'circle' | 'square' | 'triangle',
            color: SHAPE_COLORS[baseElement2.color]
          });
        }
      }
      
      generatedPattern.push(row1, row2);
    }
    
    // Chytrá logika chybějících prvků podle dokumentace
    const missing: Array<{row: number, col: number}> = [];
    
    if (difficulty === 'easy') {
      // Pro lehkou úroveň - jeden řádek
      const row = generatedPattern[0];
      const patternUnit = elements.length;
      
      // Vždy ponechá viditelný začátek vzoru
      const visibleStart = Math.min(patternUnit + 1, row.length - 6);
      // Vždy ponechá viditelný konec vzoru  
      const visibleEnd = Math.max(row.length - 3, visibleStart + 6);
      
      // V každé opakující se jednotce nechá alespoň jeden prvek viditelný
      for (let i = visibleStart; i < visibleEnd; i++) {
        const positionInUnit = i % patternUnit;
        // Strategické vybírání chybějících prvků
        if (positionInUnit === 1 || (patternUnit > 3 && positionInUnit === 3)) {
          missing.push({ row: 0, col: i });
        }
      }
      
      // Zajištění minimálního počtu chybějících prvků
      while (missing.length < 4 && missing.length < row.length - 4) {
        const randomIndex = visibleStart + Math.floor(Math.random() * (visibleEnd - visibleStart));
        if (!missing.some(pos => pos.col === randomIndex)) {
          missing.push({ row: 0, col: randomIndex });
        }
      }
    } else {
      // Pro střední a těžkou úroveň - dva řádky
      const totalElements = generatedPattern.reduce((sum, row) => sum + row.length, 0);
      const missingCount = Math.min(6 + Math.floor(Math.random() * 3), Math.floor(totalElements * 0.4));
      
      while (missing.length < missingCount) {
        const row = Math.floor(Math.random() * generatedPattern.length);
        const col = Math.floor(Math.random() * generatedPattern[row].length);
        
        if (!missing.some(pos => pos.row === row && pos.col === col)) {
          missing.push({ row, col });
        }
      }
    }
    
    return {
      pattern: generatedPattern,
      missing,
      title: selectedPattern.title,
      description: selectedPattern.description,
      difficulty
    };
  } catch (error) {
    console.warn('Fallback to default pattern:', error);
    // Fallback pattern
    return {
      pattern: [[
        { id: '1', shape: 'circle', color: SHAPE_COLORS[0] },
        { id: '2', shape: 'square', color: SHAPE_COLORS[1] }
      ]],
      missing: [],
      title: 'Základní vzor',
      description: 'Jednoduchý vzor',
      difficulty: 'easy'
    };
  }
};

// Main Component
export function PatternSequenceGame({ settings = {}, onSwitchGame }: PatternSequenceGameProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(settings.difficulty || 'easy');
  const [currentSpec, setCurrentSpec] = useState<PatternSpec>();
  const [userAnswers, setUserAnswers] = useState<Record<string, PatternElement | null>>({});
  const [availableElements, setAvailableElements] = useState<PatternElement[]>([]);
  const [elementPositions, setElementPositions] = useState<Position[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  // Screen size detection
  useEffect(() => {
    return updateScreenSize(setScreenSize);
  }, []);

  // Responzivní velikosti
  const slotSize = useMemo(() => {
    if (!currentSpec) return 80;
    
    const maxCols = Math.max(...currentSpec.pattern.map(row => row.length));
    const availableWidth = window.innerWidth - 40;
    const gapSize = screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 4 : 6;
    const totalGapWidth = (maxCols - 1) * gapSize;
    const maxSlotWidth = Math.floor((availableWidth - totalGapWidth) / maxCols);
    
    const maxSize = screenSize === 'mobile' ? 60 : screenSize === 'tablet' ? 80 : 100;
    const minSize = screenSize === 'mobile' ? 40 : screenSize === 'tablet' ? 50 : 60;
    
    return Math.max(minSize, Math.min(maxSize, maxSlotWidth));
  }, [currentSpec, screenSize]);

  // Generování nové varianty
  const generateNewVariant = useCallback(() => {
    const spec = generatePatternVariant(difficulty, settings.customPatterns || '', settings.patternTypes || []);
    setCurrentSpec(spec);
    setIsComplete(false);
    setShowSuccess(false);
  }, [difficulty, settings.customPatterns, settings.patternTypes]);

  // Inicializace a reset při změně spec
  useEffect(() => {
    if (!currentSpec) return;
    
    const missing = currentSpec.missing;
    const missingElements = missing.map(pos => currentSpec.pattern[pos.row][pos.col]);
    const shuffled = [...missingElements].sort(() => Math.random() - 0.5);
    setAvailableElements(shuffled);
    
    // Generování pozic pro přetážitelné prvky - maximálně rozházené po celé ploše
    const positions: Position[] = [];
    
    for (let i = 0; i < shuffled.length; i++) {
      let attempts = 0;
      let position: Position;
      
      do {
        position = {
          x: 2 + Math.random() * 94, // Rozsah 2-96%
          y: (screenSize === 'mobile' ? 60 : 55) + Math.random() * 38, // Rozsah 60-98% nebo 55-93%
          rotation: Math.random() * 60 - 30 // Rotace -30 až +30 stupňů
        };
        attempts++;
      } while (
        attempts < 50 && 
        positions.some(existingPos => 
          Math.abs(existingPos.x - position.x) < 15 && 
          Math.abs(existingPos.y - position.y) < 15
        )
      );
      
      positions.push(position);
    }
    setElementPositions(positions);
    
    // Reset odpovědí
    const initialAnswers: Record<string, PatternElement | null> = {};
    missing.forEach(pos => {
      initialAnswers[`${pos.row}-${pos.col}`] = null;
    });
    setUserAnswers(initialAnswers);
  }, [currentSpec, screenSize]);

  // Inicializace při prvním načtení
  useEffect(() => {
    generateNewVariant();
  }, [generateNewVariant]);

  // Drop handler s opravou bugů podle dokumentace
  const handleDrop = useCallback((slotKey: string, element: PatternElement, originalIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [slotKey]: element }));
    
    // Použití originalIndex pro přesnější odstranění elementu
    setAvailableElements(prev => prev.filter((_, index) => index !== originalIndex));
    setElementPositions(prev => prev.filter((_, index) => index !== originalIndex));
  }, []);

  // Remove handler
  const handleRemoveElement = useCallback((slotKey: string) => {
    const removedElement = userAnswers[slotKey];
    if (removedElement) {
      setUserAnswers(prev => ({ ...prev, [slotKey]: null }));
      setAvailableElements(prev => [...prev, removedElement]);
      
      // Najít novou pozici, která nekoliduje s existujícími
      let newPosition: Position;
      let attempts = 0;
      
      do {
        newPosition = {
          x: 2 + Math.random() * 94,
          y: (screenSize === 'mobile' ? 60 : 55) + Math.random() * 38,
          rotation: Math.random() * 60 - 30
        };
        attempts++;
      } while (
        attempts < 30 && 
        elementPositions.some(existingPos => 
          Math.abs(existingPos.x - newPosition.x) < 15 && 
          Math.abs(existingPos.y - newPosition.y) < 15
        )
      );
      
      setElementPositions(prev => [...prev, newPosition]);
    }
  }, [userAnswers, screenSize, elementPositions]);

  // Kontrola dokončení s automatickým pokračováním podle dokumentace
  useEffect(() => {
    if (!currentSpec) return;
    
    const missing = currentSpec.missing;
    const allFilled = missing.every(pos => userAnswers[`${pos.row}-${pos.col}`] !== null);
    const allCorrect = missing.every(pos => {
      const userElement = userAnswers[`${pos.row}-${pos.col}`];
      const expectedElement = currentSpec.pattern[pos.row][pos.col];
      return userElement && expectedElement &&
        userElement.shape === expectedElement.shape &&
        userElement.color === expectedElement.color;
    });
    
    if (allFilled && allCorrect) {
      setIsComplete(true);
      setShowSuccess(true);
      
      // Automatické pokračování za 2 sekundy
      setTimeout(() => {
        generateNewVariant();
      }, 2000);
    } else {
      setIsComplete(false);
    }
  }, [userAnswers, currentSpec, generateNewVariant]);

  // Progress calculation
  const progress = useMemo(() => {
    if (!currentSpec) return 0;
    const correctCount = currentSpec.missing.filter(pos => {
      const userElement = userAnswers[`${pos.row}-${pos.col}`];
      const expectedElement = currentSpec.pattern[pos.row][pos.col];
      return userElement && expectedElement &&
        userElement.shape === expectedElement.shape &&
        userElement.color === expectedElement.color;
    }).length;
    return (correctCount / currentSpec.missing.length) * 100;
  }, [userAnswers, currentSpec]);

  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  if (!currentSpec) {
    return <div>Načítání...</div>;
  }

  return (
    <DndProvider backend={backend}>
      <div className="w-full h-screen flex flex-col" style={{ backgroundColor: COLORS.PAGE_BG }}>
        {/* Progress bar podle dokumentace - bez pozadí, nahoře */}
        <div className="w-full py-2 z-40" style={{ backgroundColor: COLORS.PAGE_BG }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center">
              {isComplete && (
                <div className="text-center py-2 px-4 rounded-lg text-sm shadow-lg"
                     style={{ backgroundColor: COLORS.SUCCESS_BG, color: 'white', fontWeight: 'bold' }}>
                  ✅ Výborně!
                </div>
              )}
              
              {!isComplete && (
                <div className="w-32 sm:w-40 md:w-48 rounded-full h-3"
                     style={{ backgroundColor: '#E5E7EB' }}>
                  <div className="h-3 rounded-full transition-all duration-300"
                       style={{
                         backgroundColor: COLORS.GREEN,
                         width: `${progress}%`
                       }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex-none px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 style={{ 
                color: COLORS.CRIMSON, 
                fontSize: screenSize === 'mobile' ? '18px' : '22px',
                fontWeight: 'bold' 
              }}>
                {currentSpec.title}
              </h1>
              
              <div className="flex gap-2">
                {/* Responzivní tlačítka (+20% větší) podle dokumentace */}
                <button 
                  onClick={generateNewVariant} 
                  className="rounded-lg transition-all shadow-lg"
                  style={{ 
                    backgroundColor: COLORS.PURPLE, 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: screenSize === 'mobile' ? '13px' : '14px',
                    padding: screenSize === 'mobile' ? '6px 10px' : '8px 12px',
                  }}
                >
                  🎲 Nový vzor
                </button>
                
                {onSwitchGame && (
                  <button 
                    onClick={onSwitchGame} 
                    className="rounded-lg transition-all shadow-lg"
                    style={{ 
                      backgroundColor: COLORS.BLUE, 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: screenSize === 'mobile' ? '13px' : '14px',
                      padding: screenSize === 'mobile' ? '6px 10px' : '8px 12px',
                    }}
                  >
                    🔢 Čísla
                  </button>
                )}
              </div>
            </div>
            
            <p style={{ 
              color: COLORS.GRAY, 
              fontSize: screenSize === 'mobile' ? '12px' : '14px' 
            }}>
              {currentSpec.description}
            </p>
          </div>
        </div>

        {/* Hlavní herní oblast */}
        <div className="flex-1 px-4 relative">
          <div className="max-w-7xl mx-auto h-full">
            {/* Vzorová sekvence podle dokumentace */}
            <div className="flex flex-col items-center py-8">
              {currentSpec.pattern.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex justify-center items-center gap-1 sm:gap-2 mb-2">
                  {row.map((element, colIndex) => {
                    const isMissing = currentSpec.missing.some(pos => pos.row === rowIndex && pos.col === colIndex);
                    const slotKey = `${rowIndex}-${colIndex}`;
                    
                    if (isMissing) {
                      // Místo pro přetažení
                      return (
                        <DropSlot
                          key={slotKey}
                          slotKey={slotKey}
                          element={userAnswers[slotKey] || null}
                          expectedElement={element}
                          onDrop={handleDrop}
                          onRemove={handleRemoveElement}
                          size={slotSize}
                          isComplete={isComplete}
                        />
                      );
                    } else {
                      // Existující prvek
                      return (
                        <div
                          key={`fixed-${slotKey}`}
                          className="flex items-center justify-center"
                          style={{
                            width: `${slotSize}px`,
                            height: `${slotSize}px`,
                            backgroundColor: COLORS.SLOT_BG,
                            border: `3px solid ${COLORS.SLOT_LINE}`,
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <ShapeComponent element={element} size={Math.floor(slotSize * 0.8)} />
                        </div>
                      );
                    }
                  })}
                </div>
              ))}
            </div>

            {/* Přetažitelné prvky - rozházené po celé ploše */}
            <div className="mt-8">
              <div className="flex justify-center mb-4">
                <div className="flex flex-wrap justify-center gap-3 max-w-4xl relative" style={{ minHeight: '120px' }}>
                  {availableElements.map((element, index) => {
                    const position = elementPositions[index];
                    if (!position) return null;
                    
                    return (
                      <DraggablePattern
                        key={`${element.id}-${index}`}
                        element={element}
                        originalIndex={index}
                        onDrop={() => {}}
                        size={Math.floor(slotSize * 0.8)}
                        style={{
                          position: 'absolute',
                          left: `${position.x}%`,
                          top: `${position.y * 0.7}%`,
                          transform: `rotate(${position.rotation}deg)`
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Reset tlačítko dole */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    // Reset všech odpovědí
                    const resetAnswers: Record<string, PatternElement | null> = {};
                    currentSpec.missing.forEach(pos => {
                      resetAnswers[`${pos.row}-${pos.col}`] = null;
                    });
                    setUserAnswers(resetAnswers);
                    
                    // Vrátit všechny prvky
                    const allElements = currentSpec.missing.map(pos => currentSpec.pattern[pos.row][pos.col]);
                    setAvailableElements([...allElements].sort(() => Math.random() - 0.5));
                  }}
                  className="rounded-lg shadow-lg transition-all"
                  style={{
                    backgroundColor: COLORS.ORANGE,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: screenSize === 'mobile' ? '13px' : '14px',
                    padding: screenSize === 'mobile' ? '6px 10px' : '8px 12px',
                  }}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success popup podle dokumentace */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="px-6 py-4 rounded-lg shadow-lg text-center"
                 style={{ 
                   backgroundColor: COLORS.SUCCESS_BG, 
                   color: 'white',
                   fontSize: screenSize === 'mobile' ? '16px' : '20px',
                   fontWeight: 'bold'
                 }}>
              🎉 Výborně dokončeno! 🎉
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}