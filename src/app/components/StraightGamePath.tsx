import { ImageWithFallback } from './figma/ImageWithFallback';

export interface StraightGamePathProps {
  totalSteps: number;
  playerPositions: number[];
  playerColors: string[];
  packagePosition: number | null;
  lastMoveDirection: 'forward' | 'backward' | null;
  currentPlayer: number;
  isPackageAnimating?: boolean;
  playerCelebrating?: number | null;
}

export function StraightGamePath({ 
  totalSteps, 
  playerPositions, 
  playerColors, 
  packagePosition, 
  lastMoveDirection, 
  currentPlayer, 
  isPackageAnimating = false, 
  playerCelebrating = null 
}: StraightGamePathProps) {
  // Vytvoříme rovnou cestu
  const pathPoints = [];
  const startX = 100;
  const startY = 600;
  const stepWidth = 100;
  
  // Generujeme body pro rovnou cestu zleva doprava
  for (let i = 0; i < totalSteps; i++) {
    const x = startX + i * stepWidth;
    const y = startY;
    pathPoints.push({ x, y, step: i + 1 });
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 1200 1200" className="mx-auto" style={{ maxWidth: '100%', height: '100%' }}>
        {/* Vykreslíme spojnice mezi body */}
        {pathPoints.slice(0, -1).map((point, index) => {
          const nextPoint = pathPoints[index + 1];
          return (
            <line
              key={`line-${index}`}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke="#221D6E"
              strokeWidth="14"
            />
          );
        })}
        
        {/* Vykreslíme puntíky cesty */}
        {pathPoints.map((point, index) => {
          const stepNumber = index + 1;
          const isPlayerHere = playerPositions.includes(stepNumber);
          const isPackageHere = packagePosition === stepNumber;
          
          // Určíme barvu pozadí
          let fillColor = "white";
          if (isPackageHere) {
            fillColor = "#1E3A8A"; // Tmavě modrá pro balíček
          } else if (isPlayerHere) {
            // Najdeme barvu hráče na této pozici
            const playerIndex = playerPositions.findIndex(pos => pos === stepNumber);
            if (playerIndex !== -1) {
              fillColor = playerColors[playerIndex]; // Plná barva hráče
            }
          }
          
          return (
            <g key={`dot-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="42"
                fill={fillColor}
                stroke="#221D6E"
                strokeWidth="6"
              />
            </g>
          );
        })}
        
        {/* Vykreslíme balíček na jeho pozici */}
        {packagePosition && packagePosition > 0 && packagePosition <= totalSteps && (
          <g>
            {(() => {
              const point = pathPoints[packagePosition - 1];
              return (
                <>
                  {/* Emoji balíček */}
                  <text
                    x={point.x}
                    y={point.y + 10}
                    textAnchor="middle"
                    style={{ 
                      fontSize: '80px',
                      filter: isPackageAnimating ? "drop-shadow(0 0 15px #FFD700)" : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                    }}
                    className={isPackageAnimating ? "animate-bounce" : ""}
                  >
                    🎁
                  </text>
                </>
              );
            })()}
          </g>
        )}
        
        {/* Vykreslíme hráče na jejich pozicích */}
        {playerPositions.map((position, playerIndex) => {
          if (position > 0 && position <= totalSteps) {
            const point = pathPoints[position - 1];
            
            // Zkontrolujeme, kolik hráčů je na stejném políčku
            const playersOnThisPosition = playerPositions.filter(pos => pos === position);
            const isAloneOnPosition = playersOnThisPosition.length === 1;
            
            // Offset pouze pokud jsou na políčku dva hráči
            let offsetX = 0;
            let offsetY = 0;
            
            if (!isAloneOnPosition) {
              offsetX = playerIndex === 0 ? -25 : 25; // Horizontální rozestup
              offsetY = -10; // Mírně nahoru
            }
            
            const finalX = point.x + offsetX;
            const finalY = point.y + offsetY - 12;
            
            // URL obrázků podle hráče
            const playerImageUrl = playerIndex === 0 
              ? "https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kluk.svg"
              : "https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/holka.svg";
            
            // Určíme zrcadlení podle směru pohybu (pouze pro aktuálního hráče)
            const shouldFlip = playerIndex === currentPlayer && lastMoveDirection === 'backward';
            const scaleX = shouldFlip ? -1 : 1;
            
            // Určíme, jestli tento hráč slaví
            const isCelebrating = playerCelebrating === playerIndex;
            
            return (
              <g key={`player-${playerIndex}`}>
                <foreignObject
                  x={finalX - 90}
                  y={finalY - 220}
                  width="180"
                  height="220"
                >
                  <div style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}>
                    <ImageWithFallback
                      src={playerImageUrl}
                      alt={playerIndex === 0 ? "Kluk" : "Holka"}
                      className={isCelebrating ? "animate-bounce" : ""}
                      data-celebrating={isCelebrating}
                      style={{ 
                        width: '180px', 
                        height: '180px',
                        objectFit: 'contain',
                        transform: `scaleX(${scaleX})`,
                        filter: isCelebrating ? "brightness(1.2) drop-shadow(0 0 15px #FFD700)" : "none"
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}