// Robot Navigation Game Data and Logic

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface CollectiblePoint {
  x: number;
  y: number;
  number: number;
  collected: boolean;
}

export interface RobotLevel {
  id: number;
  difficulty: number;
  robotStartX: number;
  robotStartY: number;
  targetX: number;
  targetY: number;
  gridSize: number;
  collectiblePoints?: CollectiblePoint[];
}

export interface RobotLevelTemplate {
  id: number;
  difficulty: number;
  gridSize: number;
  minDistance: number;
  collectiblePointsCount?: number;
}

export const DIRECTIONS = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 }
};

export let ROBOT_LEVELS: RobotLevel[] = [];

export const ROBOT_COLORS = {
  PAGE_BACKGROUND: '#FAF5DC',
  GRID_BACKGROUND: '#FFFFFF',
  GRID_LINES: '#C0C4FF',
  PANEL_BACKGROUND: '#FFFFFF',
  PANEL_BORDER: '#D0D4F0',
  ROBOT: '#FF4D6D',
  TARGET: '#4CAF50',
  PATH: '#E0E7FF',
  TRAIL: '#4EA3FF',
  COLLECTIBLE_POINT: '#FFD700',
  COLLECTIBLE_COLLECTED: '#90EE90',
  TEXT_PRIMARY: '#9B1C1C',
  TEXT_SECONDARY: '#666666',
  BUTTON_PRIMARY: '#4EA3FF',
  BUTTON_SECONDARY: '#B0B0B0',
  BUTTON_SUCCESS: '#4CAF50',
  BUTTON_DANGER: '#FF4D6D'
};

export const ROBOT_LEVEL_TEMPLATES: RobotLevelTemplate[] = [
  {
    id: 1,
    difficulty: 1,
    gridSize: 5,
    minDistance: 3,
    collectiblePointsCount: 0
  },
  {
    id: 2,
    difficulty: 2,
    gridSize: 6,
    minDistance: 4,
    collectiblePointsCount: 2
  },
  {
    id: 3,
    difficulty: 3,
    gridSize: 7,
    minDistance: 3,
    collectiblePointsCount: 3
  }
];

// Helper functions
const isPositionOccupied = (x: number, y: number, existingPositions: Array<{x: number, y: number}>): boolean => {
  return existingPositions.some(pos => pos.x === x && pos.y === y);
};

const randomPos = (gridSize: number, minDistance: number, otherPositions: Array<{x: number, y: number}>): {x: number, y: number} | null => {
  const maxAttempts = 100;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    
    if (!isPositionOccupied(x, y, otherPositions)) {
      const validDistance = otherPositions.every(pos => {
        const distance = Math.abs(x - pos.x) + Math.abs(y - pos.y);
        return distance >= minDistance;
      });
      
      if (validDistance) {
        return { x, y };
      }
    }
  }
  
  return null;
};

const generateCollectiblePoints = (count: number, gridSize: number, existingPositions: Array<{x: number, y: number}>): CollectiblePoint[] => {
  const points: CollectiblePoint[] = [];
  const usedPositions = [...existingPositions];
  
  for (let i = 1; i <= count; i++) {
    const position = randomPos(gridSize, 1, usedPositions);
    if (position) {
      const point: CollectiblePoint = {
        x: position.x,
        y: position.y,
        number: i,
        collected: false
      };
      points.push(point);
      usedPositions.push(position);
    }
  }
  
  return points;
};

// Funkce pro práci s body ke sběru
export const isPointCollectable = (robotX: number, robotY: number, point: CollectiblePoint, collectedPoints: number[]): boolean => {
  const isAtPoint = robotX === point.x && robotY === point.y;
  const isNextInSequence = point.number === collectedPoints.length + 1;
  return isAtPoint && !point.collected && isNextInSequence;
};

export const areAllPointsCollected = (collectiblePoints: CollectiblePoint[]): boolean => {
  return collectiblePoints.every(point => point.collected);
};

export const generateLevelFromTemplate = (template: RobotLevelTemplate): RobotLevel => {
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const robotPos = randomPos(template.gridSize, 0, []);
    if (!robotPos) continue;
    
    const targetPos = randomPos(template.gridSize, template.minDistance, [robotPos]);
    if (!targetPos) continue;
    
    let collectiblePoints: CollectiblePoint[] = [];
    
    if (template.collectiblePointsCount && template.collectiblePointsCount > 0) {
      collectiblePoints = generateCollectiblePoints(
        template.collectiblePointsCount, 
        template.gridSize, 
        [robotPos, targetPos]
      );
    }
    
    return {
      id: template.id,
      difficulty: template.difficulty,
      robotStartX: robotPos.x,
      robotStartY: robotPos.y,
      targetX: targetPos.x,
      targetY: targetPos.y,
      gridSize: template.gridSize,
      collectiblePoints
    };
  }
  
  return {
    id: template.id,
    difficulty: template.difficulty,
    robotStartX: 0,
    robotStartY: 0,
    targetX: template.gridSize - 1,
    targetY: template.gridSize - 1,
    gridSize: template.gridSize,
    collectiblePoints: []
  };
};

export const initializeRandomLevels = (): RobotLevel[] => {
  const levels = ROBOT_LEVEL_TEMPLATES.map(template => generateLevelFromTemplate(template));
  return levels;
};

export const getDynamicCellSize = (gridSize: number): number => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  const isMobile = viewportWidth < 1024;
  
  let availableWidth: number, availableHeight: number;
  
  if (isMobile) {
    availableWidth = (viewportWidth - 24) * 0.8;
    availableHeight = (viewportHeight * 0.65) * 0.8;
  } else {
    const panelWidth = Math.min(450, viewportWidth * 0.3);
    availableWidth = (viewportWidth - panelWidth - 48) * 0.8;
    availableHeight = (viewportHeight - 120) * 0.8;
  }
  
  const cellCount = gridSize - 1;
  const maxCellWidth = Math.floor(availableWidth / cellCount);
  const maxCellHeight = Math.floor(availableHeight / cellCount);
  const cellSize = Math.min(maxCellWidth, maxCellHeight);
  
  const minSize = 40;
  const maxSize = 80;
  
  return Math.max(minSize, Math.min(maxSize, cellSize));
};