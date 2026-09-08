export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface PatternElement {
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  id: string;
}

export interface Position {
  x: number;
  y: number;
  rotation: number;
}

export interface PatternSpec {
  pattern: PatternElement[][];
  missing: Array<{row: number, col: number}>;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
}

export interface GameSettings {
  difficulty?: DifficultyLevel;
  patternTypes?: string[];
  shapes?: string[];
  colorGroups?: string[];
  patternLength?: [number, number];
  missingElements?: [number, number];
  customPatterns?: string;
}

export interface PatternSequenceGameProps {
  settings?: GameSettings;
  onSwitchGame?: () => void;
}