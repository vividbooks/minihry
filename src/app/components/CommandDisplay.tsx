import React from 'react';
import { Direction, DIRECTIONS } from '../constants/robotData';
import { COMMAND_PANEL_STYLES } from '../constants/commandPanelStyles';

interface CommandDisplayProps {
  commands: Direction[];
}

export function CommandDisplay({ commands }: CommandDisplayProps) {
  const { COLORS, SIZES } = COMMAND_PANEL_STYLES;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg" style={{ color: COLORS.BROWN_TEXT }}>ROZKAZ:</h3>
        <span className="text-sm" style={{ color: COLORS.TEXT_GRAY }}>
          {commands.length}
        </span>
      </div>
      
      <div 
        className="min-h-16 border-2 rounded-lg p-3 flex flex-wrap gap-2 items-center"
        style={{ 
          minHeight: SIZES.COMMAND_DISPLAY_MIN_HEIGHT,
          backgroundColor: COLORS.COMMAND_FIELD_BG,
          borderColor: COLORS.BORDER_GRAY
        }}
      >
        {commands.length === 0 ? (
          <span className="text-sm" style={{ color: COLORS.TEXT_GRAY }}>Žádné příkazy...</span>
        ) : (
          commands.map((command, index) => (
            <span
              key={index}
              className="inline-flex items-center justify-center w-8 h-8 rounded border"
              style={{ 
                fontSize: '18px',
                backgroundColor: COLORS.LIGHT_BLUE_BG,
                color: COLORS.COMMAND_TEXT,
                borderColor: COLORS.COMMAND_TEXT
              }}
            >
              {command === 'UP' ? '↑' : command === 'DOWN' ? '↓' : command === 'LEFT' ? '←' : '→'}
            </span>
          ))
        )}
      </div>
    </div>
  );
}