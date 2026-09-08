import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { RandomShape, APP_COLORS, COLORS } from '../constants/mirrorDrawingData';
import { Cell } from '../utils/mirrorDrawingLogic';

interface GameGridProps {
  level: RandomShape;
  rightGrid?: Record<string, Cell>;
  onCellClick?: (row: number, col: number) => void;
  isEvaluated: boolean;
  selectedColor: string;
}

export function GameGrid({ level, rightGrid = {}, onCellClick, isEvaluated, selectedColor }: GameGridProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Aktualizuj velikost okna
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    if (typeof window !== 'undefined') {
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Dynamické vypočítání velikosti buněk pro maximální využití prostoru
  const getDynamicCellSize = (gridSize: number, gridHeight?: number) => {
    // Vypočítáme maximální dostupnou velikost podle viewportu
    const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height;
    
    // Odečteme prostor pro ovládací panel a padding
    const isMobile = viewportWidth < 1024; // lg breakpoint
    
    let availableWidth, availableHeight;
    
    if (isMobile) {
      // Na mobilu je panel dole, využijeme 80% dostupného prostoru
      availableWidth = (viewportWidth - 24) * 0.8; // 80% šířky minus padding
      availableHeight = (viewportHeight * 0.65) * 0.8; // 80% z 65% výšky pro mřížku
    } else {
      // Na desktopu je panel vpravo, využijeme 80% zbývajícího prostoru
      const panelWidth = Math.min(450, viewportWidth * 0.3); // adaptivní šířka panelu
      availableWidth = (viewportWidth - panelWidth - 48) * 0.8; // 80% dostupné šířky
      availableHeight = (viewportHeight - 120) * 0.8; // 80% dostupné výšky
    }
    
    // Pro obdélníkové mřížky (EASY úroveň)
    const actualHeight = gridHeight || gridSize;
    
    // Vypočítáme maximální velikost buňky
    const maxCellWidth = Math.floor(availableWidth / gridSize);
    const maxCellHeight = Math.floor(availableHeight / actualHeight);
    
    // Použijeme menší z hodnot pro čtvercové buňky
    const cellSize = Math.min(maxCellWidth, maxCellHeight);
    
    // Minimální a maximální limity
    const minSize = 16; // 16px minimum pro lehčí hru
    const maxSize = 100; // 100px maximum pro větší kostičky v easy módu
    
    return Math.max(minSize, Math.min(maxSize, cellSize));
  };

  // Funkce pro získání správné CSS třídy pro grid
  const getGridClass = (gridSize: number) => {
    const gridClasses: Record<number, string> = {
      6: 'grid-cols-6', // Pro EASY úroveň 6x3
      10: 'grid-cols-10', // Pro MEDIUM úroveň 10x5
      12: 'grid-cols-12',
      14: 'grid-cols-[repeat(14,minmax(0,1fr))]',
      16: 'grid-cols-[repeat(16,minmax(0,1fr))]'
    };
    return gridClasses[gridSize] || 'grid-cols-10';
  };

  const dynamicCellSize = getDynamicCellSize(level.gridSize, level.gridHeight);
  const gridClass = getGridClass(level.gridSize);

  // Zjisti jestli je vybraná guma
  const isEraser = selectedColor === COLORS[COLORS.length - 1];

  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isEvaluated) return;
    // Pouze pravá polovina je klikatelná
    if (col < level.gridSize / 2) return;
    
    setIsDrawing(true);
    onCellClick?.(row, col);
  }, [isEvaluated, level.gridSize, onCellClick]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isDrawing || isEvaluated) return;
    // Pouze pravá polovina je klikatelná
    if (col < level.gridSize / 2) return;
    
    onCellClick?.(row, col);
  }, [isDrawing, isEvaluated, level.gridSize, onCellClick]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const renderCell = (row: number, col: number) => {
    const key = `${row},${col}`;
    const isLeftHalf = col < level.gridSize / 2;
    const isRightHalf = col >= level.gridSize / 2;
    const isOnDivider = col === (level.gridSize / 2) - 1;
    
    let cellColor = APP_COLORS.GRID_BACKGROUND;
    let isCorrect: boolean | undefined;
    let isClickable = false;
    let cellOpacity = 1;
    let showSpecialBorder = false;

    // Logika pro zrcadlové kreslení
    if (isLeftHalf) {
      // Levá polovina - vzor
      cellColor = level.shape[key] || APP_COLORS.GRID_BACKGROUND;
    } else {
      // Pravá polovina - kreslící oblast
      const cell = rightGrid[key];
      cellColor = cell?.color || APP_COLORS.GRID_BACKGROUND;
      isCorrect = cell?.isCorrect;
      isClickable = !isEvaluated;
      showSpecialBorder = true; // Pravá polovina má speciální border
    }

    // Cursor pro kreslení/mazání
    const cursorClass = isClickable ? (isEraser ? 'cursor-grab' : 'cursor-crosshair') : '';
    
    // Žádné speciální styly pro mirror mód
    const modeStyles = {};

    return (
      <div
        key={key}
        className={`
          relative flex-shrink-0 select-none
          ${cursorClass}
          ${isEvaluated && showSpecialBorder && isCorrect !== undefined ? 
            (isCorrect ? 'ring-1 ring-green-500' : 'ring-1 ring-red-500') : ''}

        `}
        style={{ 
          width: `${dynamicCellSize}px`,
          height: `${dynamicCellSize}px`,
          backgroundColor: cellColor,
          opacity: cellOpacity,
          border: '0.5px solid #C0C4FF',
          borderRightColor: isOnDivider ? APP_COLORS.DIVIDER_LINE : '#C0C4FF',
          borderRightWidth: isOnDivider ? '4px' : '0.5px',
          ...modeStyles
        }}
        onMouseDown={() => handleMouseDown(row, col)}
        onMouseEnter={() => handleMouseEnter(row, col)}
        onMouseUp={handleMouseUp}
      >

        
        {/* Ikona pro vyhodnocení */}
        {isEvaluated && showSpecialBorder && isCorrect !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            {isCorrect ? (
              <CheckCircle 
                className="text-green-600" 
                style={{ 
                  width: `${Math.min(dynamicCellSize * 0.6, 24)}px`, 
                  height: `${Math.min(dynamicCellSize * 0.6, 24)}px` 
                }} 
              />
            ) : (
              <XCircle 
                className="text-red-600" 
                style={{ 
                  width: `${Math.min(dynamicCellSize * 0.6, 24)}px`, 
                  height: `${Math.min(dynamicCellSize * 0.6, 24)}px` 
                }} 
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Render pro oba módy - jedna mřížka s rozdělením
  return (
    <div className="select-none w-full h-full flex items-center justify-center">
      <div 
        className={`grid ${gridClass} w-fit`}
        style={{ 
          backgroundColor: APP_COLORS.GRID_BACKGROUND,
          border: '3px solid #C0C4FF',
          borderRadius: '12px',
          padding: '4px'
        }}
        onMouseLeave={handleMouseUp}
      >
        {Array.from({ length: level.gridSize * (level.gridHeight || level.gridSize) }, (_, index) => {
          const row = Math.floor(index / level.gridSize);
          const col = index % level.gridSize;
          return renderCell(row, col);
        })}
      </div>
    </div>
  );
}