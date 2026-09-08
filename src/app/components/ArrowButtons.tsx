import React from 'react';
import { Direction, DIRECTIONS } from '../constants/robotData';
import { Button } from './ui/button';
import { COMMAND_PANEL_STYLES } from '../constants/commandPanelStyles';

interface ArrowButtonsProps {
  onAddCommand: (direction: Direction) => void;
  isDisabled: boolean;
}

export function ArrowButtons({ onAddCommand, isDisabled }: ArrowButtonsProps) {
  const { COLORS, SIZES } = COMMAND_PANEL_STYLES;

  const buttonConfigs = [
    { direction: 'LEFT' as Direction, bg: COLORS.GREEN_BUTTON, border: COLORS.GREEN_BORDER },
    { direction: 'UP' as Direction, bg: COLORS.PURPLE_BUTTON, border: COLORS.PURPLE_BORDER },
    { direction: 'DOWN' as Direction, bg: COLORS.RED_BUTTON, border: COLORS.RED_BORDER },
    { direction: 'RIGHT' as Direction, bg: COLORS.BLUE_BUTTON, border: COLORS.BLUE_BORDER }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg" style={{ color: COLORS.BROWN_TEXT }}>Šipky:</h3>
      
      <div className="flex justify-center gap-2">
        {buttonConfigs.map(({ direction, bg, border }) => (
          <Button
            key={direction}
            onClick={() => onAddCommand(direction)}
            disabled={isDisabled}
            className={`${SIZES.ARROW_BUTTON} text-2xl border-2 rounded-lg`}
            style={{ 
              backgroundColor: bg,
              borderColor: border,
              color: 'white'
            }}
          >
            {direction === 'UP' ? '↑' : direction === 'DOWN' ? '↓' : direction === 'LEFT' ? '←' : '→'}
          </Button>
        ))}
      </div>
    </div>
  );
}