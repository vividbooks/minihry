import React from 'react';
import { Direction } from '../constants/robotData';
import { Button } from './ui/button';
import { Trash2, Play, RotateCcw } from 'lucide-react';
import { ArrowButtons } from './ArrowButtons';
import { CommandDisplay } from './CommandDisplay';
import { COMMAND_PANEL_STYLES } from '../constants/commandPanelStyles';

interface CommandPanelProps {
  commands: Direction[];
  onAddCommand: (direction: Direction) => void;
  onClearCommands: () => void;
  onExecute: () => void;
  isAnimating: boolean;
  // Nové props pro level selector
  currentLevelIndex: number;
  levels: Array<{ id: number; difficulty: number }>;
  onLevelSelect: (levelIndex: number) => void;
  onRegenerateLevel: () => void;
}

export function CommandPanel({ 
  commands, 
  onAddCommand, 
  onClearCommands, 
  onExecute, 
  isAnimating,
  currentLevelIndex,
  levels,
  onLevelSelect,
  onRegenerateLevel
}: CommandPanelProps) {
  const { COLORS, SIZES } = COMMAND_PANEL_STYLES;
  const isButtonDisabled = isAnimating;
  
  const getStarDisplay = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };
  
  return (
    <div 
      className="rounded-2xl p-6 shadow-lg border-2 space-y-6 w-full max-w-md"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#E0E0E0'
      }}
    >
      
      {/* Nadpis */}
      <div className="text-center">
        <h1 className="text-xl" style={{ color: COLORS.BROWN_TEXT }}>Doveď robota 🤖 k cíli 🎯</h1>
      </div>

      {/* Šipky sekce */}
      <ArrowButtons 
        onAddCommand={onAddCommand}
        isDisabled={isButtonDisabled}
      />

      {/* Pole rozkazů */}
      <CommandDisplay 
        commands={commands}
      />

      {/* Velké tlačítko Běž */}
      <Button
        onClick={onExecute}
        disabled={isAnimating || commands.length === 0}
        className={`w-full ${SIZES.EXECUTE_BUTTON_HEIGHT} text-xl text-white border-0 rounded-lg hover:opacity-90`}
        style={{ 
          backgroundColor: COLORS.GREEN_BUTTON,
          borderColor: COLORS.GREEN_BUTTON
        }}
      >
        <Play className="w-6 h-6 mr-3" />
        {isAnimating ? 'Běží...' : 'Běž'}
      </Button>

      {/* Tlačítko pro regenerování pozic */}
      <Button
        onClick={onRegenerateLevel}
        disabled={isAnimating}
        variant="outline"
        className="w-full h-12 border-2 rounded-lg"
        style={{ 
          borderColor: COLORS.BORDER_GRAY,
          color: COLORS.TEXT_GRAY
        }}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Nové pozice
      </Button>

      {/* Funkční tlačítka */}
      <div className="flex gap-3">
        <Button
          onClick={onClearCommands}
          disabled={isAnimating || commands.length === 0}
          variant="outline"
          className={`flex-1 ${SIZES.FUNCTION_BUTTON_HEIGHT} border-2 rounded-lg`}
          style={{ 
            borderColor: COLORS.BORDER_GRAY,
            color: COLORS.TEXT_GRAY
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
        </Button>
        
        <Button
          onClick={onClearCommands}
          disabled={isAnimating || commands.length === 0}
          variant="outline"
          className={`flex-1 ${SIZES.FUNCTION_BUTTON_HEIGHT} border-2 rounded-lg`}
          style={{ 
            borderColor: COLORS.BORDER_GRAY,
            color: COLORS.TEXT_GRAY
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
        </Button>
      </div>

      {/* Level selector s hvězdičkami na spodu */}
      <div className="space-y-3">
        <div className="flex justify-center gap-2">
          {levels.map((level, index) => (
            <Button
              key={level.id}
              onClick={() => onLevelSelect(index)}
              disabled={isAnimating}
              variant={index === currentLevelIndex ? "default" : "outline"}
              className="text-lg px-3 py-2 rounded-lg border-2"
              style={{
                backgroundColor: index === currentLevelIndex ? '#8B4513' : 'transparent',
                borderColor: index === currentLevelIndex ? '#8B4513' : COLORS.BORDER_GRAY,
                color: index === currentLevelIndex ? 'white' : COLORS.TEXT_GRAY
              }}
            >
              {getStarDisplay(level.difficulty)}
            </Button>
          ))}
        </div>
      </div>

      {/* Instrukce na spodu */}
      <div className="text-center pt-2">
        <p className="text-sm" style={{ color: COLORS.TEXT_GRAY }}>
          🤖 Klikej na šipky pro ovládání robota
        </p>
      </div>
    </div>
  );
}