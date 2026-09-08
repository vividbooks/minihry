import { GRID_CONSTANTS } from '../constants/tilingGridConstants';
import { PlacedTile } from '../constants/tilingData';

// Výpočet velikosti buněk na základě viewportu
export const calculateCellSize = (gridWidth: number, gridHeight: number): number => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  const isMobile = viewportWidth < GRID_CONSTANTS.MOBILE_BREAKPOINT;
  
  let availableWidth: number, availableHeight: number;
  
  if (isMobile) {
    availableWidth = (viewportWidth - GRID_CONSTANTS.VIEWPORT.MOBILE_MARGIN) * GRID_CONSTANTS.VIEWPORT.MOBILE_WIDTH_RATIO;
    availableHeight = (viewportHeight * GRID_CONSTANTS.VIEWPORT.MOBILE_HEIGHT_RATIO) * GRID_CONSTANTS.VIEWPORT.MOBILE_WIDTH_RATIO;
  } else {
    const panelWidth = Math.min(GRID_CONSTANTS.VIEWPORT.MAX_PANEL_WIDTH, viewportWidth * GRID_CONSTANTS.VIEWPORT.DESKTOP_PANEL_WIDTH_RATIO);
    availableWidth = (viewportWidth - panelWidth - GRID_CONSTANTS.VIEWPORT.MARGIN) * GRID_CONSTANTS.VIEWPORT.DESKTOP_WIDTH_RATIO;
    availableHeight = (viewportHeight - GRID_CONSTANTS.VIEWPORT.HEADER_HEIGHT) * GRID_CONSTANTS.VIEWPORT.DESKTOP_HEIGHT_RATIO;
  }
  
  const maxCellWidth = Math.floor(availableWidth / gridWidth);
  const maxCellHeight = Math.floor(availableHeight / gridHeight);
  const computedSize = Math.min(maxCellWidth, maxCellHeight);
  
  return Math.max(GRID_CONSTANTS.CELL_SIZE.MIN, Math.min(GRID_CONSTANTS.CELL_SIZE.MAX, computedSize));
};

// Výpočet pozice při drag operaci
export const calculateDragPosition = (
  e: React.DragEvent,
  gridRef: React.RefObject<HTMLDivElement>,
  cellSize: number
): { x: number; y: number } => {
  if (!gridRef.current) return { x: 0, y: 0 };
  
  const rect = gridRef.current.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left - GRID_CONSTANTS.PADDING) / cellSize);
  const y = Math.floor((e.clientY - rect.top - GRID_CONSTANTS.PADDING) / cellSize);
  
  return { x, y };
};

// Kontrola zda buňka má souseda v daném směru
export const hasNeighbor = (
  tile: PlacedTile, 
  rowIndex: number, 
  colIndex: number, 
  direction: 'top' | 'right' | 'bottom' | 'left'
): boolean => {
  const currentX = tile.x + colIndex;
  const currentY = tile.y + rowIndex;
  
  let checkX = currentX;
  let checkY = currentY;
  
  switch (direction) {
    case 'top': checkY -= 1; break;
    case 'right': checkX += 1; break;
    case 'bottom': checkY += 1; break;
    case 'left': checkX -= 1; break;
  }
  
  return tile.pattern[checkY - tile.y]?.[checkX - tile.x] === true;
};

// Získání pozice s offsetem pro padding
export const getPositionWithPadding = (x: number, y: number, cellSize: number, offset: number = 0): { left: number; top: number } => ({
  left: x * cellSize + offset + GRID_CONSTANTS.PADDING,
  top: y * cellSize + offset + GRID_CONSTANTS.PADDING
});

// Generování unikátního ID pro tile
export const generateTileId = (shapeId: string): string => 
  `${shapeId}-${Date.now()}-${Math.random()}`;