import React from 'react';

interface LegoBlockProps {
  value: number; // 0-10
  isTarget?: boolean;
  scale?: number;
  highlightedCount?: number; // Kolik kolečeček je zvýrazněno (pro animaci počítání)
  highlightColor?: 'green' | 'red'; // Barva zvýraznění
}

// Barvy pro jednotlivé hodnoty
const LEGO_COLORS: { [key: number]: { light: string; dark: string; lightCircle: string; darkCircle: string } } = {
  0: { light: '#FFFFFF', dark: '#E0E0E0', lightCircle: '#FFFFFF', darkCircle: '#E0E0E0' },
  1: { light: '#E0E0E0', dark: '#B0B0B0', lightCircle: '#E7E7E7', darkCircle: '#B0B0B0' },
  2: { light: '#E34242', dark: '#7A1C1C', lightCircle: '#FF6B6B', darkCircle: '#7A1C1C' },
  3: { light: '#8DE2C8', dark: '#1F6B5A', lightCircle: '#A6F2DA', darkCircle: '#3BAA8A' },
  4: { light: '#A9A3FF', dark: '#4D3FA6', lightCircle: '#C1B8FF', darkCircle: '#5D50B8' },
  5: { light: '#FFD84C', dark: '#8C7B00', lightCircle: '#FFF2A6', darkCircle: '#C7A900' },
  6: { light: '#3C8C6C', dark: '#205E46', lightCircle: '#61B58D', darkCircle: '#2E7559' },
  7: { light: '#2E2F6D', dark: '#000000', lightCircle: '#595A89', darkCircle: '#1D1E50' },
  8: { light: '#A47B50', dark: '#5E4630', lightCircle: '#B48C63', darkCircle: '#735B3D' },
  9: { light: '#55A2FF', dark: '#303D99', lightCircle: '#7AC4FF', darkCircle: '#4775D1' },
  10: { light: '#FF7B7B', dark: '#C73546', lightCircle: '#FF9B9B', darkCircle: '#E04A55' },
};

export function LegoBlock({ value, isTarget = false, scale = 1, highlightedCount = 0, highlightColor }: LegoBlockProps) {
  // Pro hodnotu 0 zobrazíme prázdné místo s otazníkem
  if (value === 0) {
    const emptyWidth = 60;
    const emptyHeight = 100;
    
    return (
      <div 
        className="relative inline-flex items-center justify-center"
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'center top',
          width: `${emptyWidth}px`,
          height: `${emptyHeight}px`,
        }}
      >
        <div 
          className="flex items-center justify-center rounded-lg border-4 border-dashed border-gray-400 bg-gray-100"
          style={{
            width: `${emptyWidth}px`,
            height: `${emptyHeight}px`,
          }}
        >
          <span className="text-5xl font-bold text-gray-400">?</span>
        </div>
      </div>
    );
  }

  const colors = LEGO_COLORS[value] || LEGO_COLORS[1];
  
  // Barvy pro zvýraznění
  const highlightColors = {
    green: { light: '#4ade80', dark: '#16a34a' }, // Zelená
    red: { light: '#f87171', dark: '#dc2626' } // Červená
  };
  
  // Rozměry
  const blockWidth = 60;
  const blockTopHeight = 40;
  const blockBottomHeight = 30;
  const circleSize = 40;
  const circleGap = 10; // Mezera mezi tmavým a bílým kolečkem
  const circleOffset = 37; // Posun kolečka dolů od vrcholu horní části
  
  // Výška celé kostičky včetně kolečka
  const totalHeight = blockBottomHeight + blockTopHeight + circleSize + circleGap - circleOffset;
  
  return (
    <div className="relative inline-flex" style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
      {/* Kontejner pro všechna políčka - bez mezer mezi nimi */}
      <div className="flex items-end" style={{ gap: 0 }}>
        {Array.from({ length: value }).map((_, index) => (
          <div
            key={index}
            className="relative"
            style={{
              width: `${blockWidth}px`,
              height: `${totalHeight}px`,
            }}
          >
            {/* Struktura zdola nahoru: */}
            
            {/* 1. Dolní část (tmavá) - úplně dole */}
            <div
              style={{
                width: `${blockWidth}px`,
                height: `${blockBottomHeight}px`,
                backgroundColor: colors.dark,
                position: 'absolute',
                bottom: 0,
                left: 0,
              }}
            />
            
            {/* 2. Horní část (světlá) - nad dolní částí */}
            <div
              style={{
                width: `${blockWidth}px`,
                height: `${blockTopHeight}px`,
                backgroundColor: colors.light,
                position: 'absolute',
                bottom: `${blockBottomHeight}px`,
                left: 0,
              }}
            />
            
            {/* 3. Tmavé dolní kolečko - nad horní částí, posunuté dolů o 30px */}
            <div
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                backgroundColor: highlightColor && index < highlightedCount 
                  ? highlightColors[highlightColor].dark 
                  : colors.darkCircle,
                position: 'absolute',
                bottom: `${blockBottomHeight + blockTopHeight - circleOffset}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                transition: 'background-color 0.3s ease',
              }}
            />
            
            {/* 4. Světlé horní kolečko - 3px nad tmavým kolečkem */}
            <div
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                backgroundColor: highlightColor && index < highlightedCount 
                  ? highlightColors[highlightColor].light 
                  : colors.lightCircle,
                position: 'absolute',
                bottom: `${blockBottomHeight + blockTopHeight - circleOffset + circleGap}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                transition: 'background-color 0.3s ease',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
