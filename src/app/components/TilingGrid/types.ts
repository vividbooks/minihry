import { TilingLevel, PlacedTile } from '../../constants/tilingData';

export interface TilingGridProps {
  level: TilingLevel;
  placedTiles: PlacedTile[];
  onTilePlace: (tile: PlacedTile) => void;
  onTileRemove: (tileId: string) => void;
  draggedShape: { shapeId: string; rotation: number; colors: Record<string, string> } | null;
  gamePhase: 'placing' | 'counting' | 'completed';
}

export interface HoverPosition {
  x: number;
  y: number;
}

export interface GridDimensions {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
}

export interface TileColors {
  baseColor: string;
  outlineColor: string;
}