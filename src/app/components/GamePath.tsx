import { ImageWithFallback } from './figma/ImageWithFallback';

export interface GamePathProps {
  totalSteps: number;
  playerPositions: number[];
  playerColors: string[];
  packagePosition: number | null;
  lastMoveDirection: 'forward' | 'backward' | null;
  currentPlayer: number;
  isPackageAnimating?: boolean;
  playerCelebrating?: number | null;
}

export function GamePath({ totalSteps, playerPositions, playerColors, packagePosition, lastMoveDirection, currentPlayer, isPackageAnimating = false, playerCelebrating = null }: GamePathProps) {
  // Vytvoříme kruhovou cestu - zvětšeno o 20%
  const pathPoints = [];
  const centerX = 600;
  const centerY = 600;
  const radius = 384;
  
  // Generujeme body pro kruhovou cestu
  for (let i = 0; i < totalSteps; i++) {
    // Začínáme nahoře a jdeme po směru hodinových ručiček
    const angle = (i / totalSteps) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
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
                  {/* Emoji balíček - blíž k tečce */}
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
            
            // Vypočítáme úhel pro rotaci (stejně jako při generování pozic)
            const angle = ((position - 1) / totalSteps) * 2 * Math.PI - Math.PI / 2;
            const rotationDegrees = (angle * 180) / Math.PI + 90; // +90 pro správnou orientaci
            
            // Zkontrolujeme, kolik hráčů je na stejném políčku
            const playersOnThisPosition = playerPositions.filter(pos => pos === position);
            const isAloneOnPosition = playersOnThisPosition.length === 1;
            
            // Offset pouze pokud jsou na políčku dva hráči
            let offsetX = 0;
            let offsetY = 0;
            
            if (!isAloneOnPosition) {
              const radialOffset = playerIndex === 0 ? -18 : 18; // Zvětšený offset pro větší plochu
              offsetX = radialOffset * Math.cos(angle + Math.PI / 2);
              offsetY = radialOffset * Math.sin(angle + Math.PI / 2);
            }
            
            const finalX = point.x + offsetX;
            const finalY = point.y + offsetY - 12; // Zvětšený posun nahoru pro větší plochu
            
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
              <g 
                key={`player-${playerIndex}`}
                transform={`rotate(${rotationDegrees} ${finalX} ${finalY})`}
              >
                <foreignObject
                  x={finalX - 90}   // Zvětšeno o 20% (75 * 1.2 = 90)
                  y={finalY - 220}  // Zvětšeno více pro animaci (180 + 40 = 220)
                  width="180"       // Zvětšeno o 20% (150 * 1.2 = 180)
                  height="220"      // Zvětšeno více pro animaci (180 + 40 = 220)
                >
                  <div style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end', // Umístíme figurku dolů v kontejneru
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