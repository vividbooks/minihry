import React from 'react';
import { COLORS } from '../constants/gameData';

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  // Použijeme pouze barevné barvy (přeskočíme bílou)
  const availableColors = COLORS.slice(1);

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4 bg-white rounded-lg border-2" style={{ borderColor: '#C0C4FF' }}>
      <h3 className="w-full text-center mb-2" style={{ color: '#9B1C1C' }}>
        ✏️ Vyber barvu
      </h3>
      <div className="flex gap-2 flex-wrap justify-center">
        {availableColors.map((color, index) => (
          <button
            key={color}
            className={`
              w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110
              ${selectedColor === color ? 'ring-4 ring-offset-2' : ''}
            `}
            style={{ 
              backgroundColor: color,
              borderColor: selectedColor === color ? '#9B1C1C' : '#C0C4FF',
              ringColor: selectedColor === color ? '#9B1C1C' : 'transparent'
            }}
            onClick={() => onColorSelect(color)}
            title={`Barva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}