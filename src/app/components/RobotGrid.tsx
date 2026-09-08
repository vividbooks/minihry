import React, { useEffect, useState, useContext } from 'react';
import { RobotLevel, Direction, ROBOT_COLORS, DIRECTIONS, CollectiblePoint, isPointCollectable, areAllPointsCollected } from '../constants/robotData';
import { AudioContext } from './AudioManager';

// Komponenta pro načítání speciální SVG ikony robota ze Supabase
const RobotIcon = ({ size }: { size: number }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadSvgIcon = async () => {
      try {
        const response = await fetch(
          'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/dalsisymboly_4_3_robot.svg'
        );
        
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
        } else {
          // Fallback k emoji
          setSvgContent('🤖');
        }
      } catch (error) {
        console.error('Error loading robot icon:', error);
        // Fallback k emoji
        setSvgContent('🤖');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSvgIcon();
  }, []);
  
  if (isLoading) {
    return <div style={{ width: size, height: size }} className="animate-pulse bg-white/20 rounded" />;
  }
  
  if (svgContent === '🤖') {
    return (
      <span className="text-white" style={{ fontSize: `${size * 0.6}px` }}>
        🤖
      </span>
    );
  }
  
  return (
    <div 
      style={{ 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      dangerouslySetInnerHTML={{ 
        __html: svgContent.replace(/<svg/, `<svg style="width: ${size}px; height: ${size}px;"`) 
      }}
    />
  );
};

interface RobotGridProps {
  level: RobotLevel;
  isAnimating: boolean;
  commands: Direction[];
  onAnimationComplete: (success: boolean) => void;
}

export function RobotGrid({ level, isAnimating, commands, onAnimationComplete }: RobotGridProps) {
  const { playSound } = useContext(AudioContext);
  const [robotPosition, setRobotPosition] = useState({ x: level.robotStartX, y: level.robotStartY });
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [animationPath, setAnimationPath] = useState<Array<{ x: number; y: number }>>([]);
  const [robotTrail, setRobotTrail] = useState<Array<{ x: number; y: number }>>([]);
  const [collectedPointNumbers, setCollectedPointNumbers] = useState<number[]>([]);
  const [levelCollectiblePoints, setLevelCollectiblePoints] = useState<CollectiblePoint[]>(
    level.collectiblePoints ? [...level.collectiblePoints] : []
  );
  const [animatingPointId, setAnimatingPointId] = useState<string | null>(null);
  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

  // Reset pozice robota při změně levelu
  useEffect(() => {
    setRobotPosition({ x: level.robotStartX, y: level.robotStartY });
    setCurrentCommandIndex(0);
    setAnimationPath([]);
    setRobotTrail([]);
    setCollectedPointNumbers([]);
    setLevelCollectiblePoints(level.collectiblePoints ? [...level.collectiblePoints] : []);
    setAnimatingPointId(null);
    setIsSuccessAnimating(false);
  }, [level]);

  // Funkce pro kontrolu a sběr bodů
  const checkAndCollectPoint = (robotX: number, robotY: number, currentCollectedNumbers: number[] = collectedPointNumbers): boolean => {
    // Najdeme všechny body na aktuální pozici robota, které ještě nebyly sebrány
    const pointsAtPosition = levelCollectiblePoints.filter(point => 
      point.x === robotX && point.y === robotY && !point.collected
    );
    
    if (pointsAtPosition.length === 0) return false;
    
    // Kontrola, zda můžeme sebrat nějaký bod v pořadí
    const nextExpectedNumber = currentCollectedNumbers.length + 1;
    const collectablePoint = pointsAtPosition.find(point => point.number === nextExpectedNumber);
    
    if (collectablePoint) {
      // Označit bod jako sebraný
      setLevelCollectiblePoints(prev => 
        prev.map(point => 
          point.x === collectablePoint.x && point.y === collectablePoint.y 
            ? { ...point, collected: true } 
            : point
        )
      );
      
      // Přidat číslo do seznamu sebraných bodů
      setCollectedPointNumbers(prev => [...prev, collectablePoint.number]);
      return true;
    }
    
    return false;
  };

  // Animace pohybu robota
  useEffect(() => {
    if (!isAnimating || commands.length === 0) return;

    const animateMovement = async () => {
      let currentX = level.robotStartX;
      let currentY = level.robotStartY;
      const path = [{ x: currentX, y: currentY }];
      const trail: Array<{ x: number; y: number }> = [{ x: currentX, y: currentY }];
      let currentCollectedNumbers: number[] = [];

      // Kontrola počátečního bodu (pokud robot začíná na sběratelném bodě)
      const initialCollection = levelCollectiblePoints.find(point => 
        point.x === currentX && point.y === currentY && !point.collected && point.number === 1
      );
      
      if (initialCollection) {
        // Spustit animaci kostičky před sebráním
        const pointId = `${initialCollection.x}-${initialCollection.y}-${initialCollection.number}`;
        setAnimatingPointId(pointId);
        
        // Přehrát zvuk sběru kostičky
        playSound('collectPoint');
        
        // Krátká pauza pro animaci kostičky
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setLevelCollectiblePoints(prev => 
          prev.map(point => 
            point.x === initialCollection.x && point.y === initialCollection.y 
              ? { ...point, collected: true } 
              : point
          )
        );
        currentCollectedNumbers = [initialCollection.number];
        setCollectedPointNumbers(currentCollectedNumbers);
        setAnimatingPointId(null);
      }

      // Simulace pohybu pro každý příkaz
      for (let i = 0; i < commands.length; i++) {
        setCurrentCommandIndex(i);
        
        const direction = DIRECTIONS[commands[i]];
        const newX = currentX + direction.dx;
        const newY = currentY + direction.dy;

        // Kontrola hranic mřížky (pozice na průsečících jsou 0 až gridSize-1)
        if (newX >= 0 && newX < level.gridSize && newY >= 0 && newY < level.gridSize) {
          currentX = newX;
          currentY = newY;
          path.push({ x: currentX, y: currentY });
          trail.push({ x: currentX, y: currentY });
          
          setRobotPosition({ x: currentX, y: currentY });
          setAnimationPath([...path]);
          setRobotTrail([...trail]);
          
          // Kontrola a sběr bodu na nové pozici
          const pointsAtPosition = levelCollectiblePoints.filter(point => 
            point.x === currentX && point.y === currentY && !point.collected
          );
          
          if (pointsAtPosition.length > 0) {
            const nextExpectedNumber = currentCollectedNumbers.length + 1;
            const collectablePoint = pointsAtPosition.find(point => point.number === nextExpectedNumber);
            
            if (collectablePoint) {
              // Spustit animaci kostičky před sebráním
              const pointId = `${collectablePoint.x}-${collectablePoint.y}-${collectablePoint.number}`;
              setAnimatingPointId(pointId);
              
              // Přehrát zvuk sběru kostičky
              playSound('collectPoint');
              
              // Krátká pauza pro animaci kostičky
              await new Promise(resolve => setTimeout(resolve, 600));
              
              // Okamžitě aktualizovat lokální stav
              currentCollectedNumbers = [...currentCollectedNumbers, collectablePoint.number];
              
              // Aktualizovat React stav
              setLevelCollectiblePoints(prev => 
                prev.map(point => 
                  point.x === collectablePoint.x && point.y === collectablePoint.y 
                    ? { ...point, collected: true } 
                    : point
                )
              );
              setCollectedPointNumbers(currentCollectedNumbers);
              setAnimatingPointId(null);
            }
          }
          
          // Pauza mezi pohyby
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          // Robot narazil do hranice - návrat na původní pozici
          await returnRobotToStart();
          onAnimationComplete(false);
          return;
        }
      }

      // Kontrola, zda robot dosáhl cíle a sebral všechny potřebné body
      const isAtTarget = currentX === level.targetX && currentY === level.targetY;
      
      // Kontrola všech sebraných bodů - použití lokálního stavu místo React stavu
      let allPointsCollected = true;
      if (level.collectiblePoints && level.collectiblePoints.length > 0) {
        // Pokud jsou nějaké sběratelné body, musíme je všechny sebrat
        allPointsCollected = currentCollectedNumbers.length === level.collectiblePoints.length;
        
        // Dodatečná kontrola - všechny čísla musí být v pořadí od 1 do počtu bodů
        const expectedNumbers = Array.from({ length: level.collectiblePoints.length }, (_, i) => i + 1);
        const sortedCollected = [...currentCollectedNumbers].sort((a, b) => a - b);
        allPointsCollected = allPointsCollected && 
          expectedNumbers.every((num, index) => sortedCollected[index] === num);
      }
      // Pokud nejsou žádné sběratelné body, považujeme je za automaticky sebrané
      
      const success = isAtTarget && allPointsCollected;
      
      // Debug výpis pro ladění
      console.log('🤖 Robot Game Debug:', {
        currentPosition: { x: currentX, y: currentY },
        targetPosition: { x: level.targetX, y: level.targetY },
        isAtTarget,
        totalCollectiblePoints: level.collectiblePoints?.length || 0,
        collectedNumbers: currentCollectedNumbers,
        allPointsCollected,
        success
      });
      
      if (success) {
        // Robot úspěšně dosáhl cíle - spustit oslavnou animaci
        setIsSuccessAnimating(true);
        
        // Přehrát zvuk úspěchu
        playSound('correct');
        
        // Počkat na dokončení animace (1.2s)
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setIsSuccessAnimating(false);
      } else {
        // Robot se nedostal k cíli nebo nesebral všechny body - návrat na původní pozici
        await returnRobotToStart();
      }
      
      onAnimationComplete(success);
    };

    const returnRobotToStart = async () => {
      // Pauza před návratem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Plynulý návrat na původní pozici a reset bodů
      setRobotPosition({ x: level.robotStartX, y: level.robotStartY });
      setAnimationPath([]);
      setRobotTrail([]);
      setCollectedPointNumbers([]);
      setAnimatingPointId(null);
      
      // Reset všech bodů na původní stav (nesebrané)
      if (level.collectiblePoints) {
        setLevelCollectiblePoints(level.collectiblePoints.map(point => ({
          ...point,
          collected: false
        })));
      }
      
      // Krátká pauza po návratu
      await new Promise(resolve => setTimeout(resolve, 500));
    };

    animateMovement();
  }, [isAnimating, commands, level, onAnimationComplete]);

  // Dynamické vypočítání velikosti buněk - mřížka na 80% obrazovky
  const getDynamicCellSize = (gridSize: number) => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    const isMobile = viewportWidth < 1024;
    
    let availableWidth, availableHeight;
    
    if (isMobile) {
      // Mobilní zařízení - 80% šířky a 70% výšky (kvůli ovládacímu panelu dole)
      availableWidth = viewportWidth * 0.8;
      availableHeight = viewportHeight * 0.7;
    } else {
      // Desktop - 80% šířky pro celou obrazovku, ale respektujeme boční panel
      const panelWidth = Math.min(450, viewportWidth * 0.3);
      availableWidth = (viewportWidth - panelWidth - 64) * 0.8; // 64px = padding/margins
      availableHeight = viewportHeight * 0.8;
    }
    
    // Pro grid s průsečíky potřebujeme gridSize-1 buněk
    const cellCount = gridSize - 1;
    const maxCellWidth = Math.floor(availableWidth / cellCount);
    const maxCellHeight = Math.floor(availableHeight / cellCount);
    const cellSize = Math.min(maxCellWidth, maxCellHeight);
    
    const minSize = 50; // Zvýšeno minimální velikost
    const maxSize = 120; // Zvýšeno maximální velikost
    
    return Math.max(minSize, Math.min(maxSize, cellSize));
  };

  const cellSize = getDynamicCellSize(level.gridSize);
  const gridWidth = (level.gridSize - 1) * cellSize; // Šířka mřížky pro buňky
  const gridHeight = (level.gridSize - 1) * cellSize; // Výška mřížky pro buňky

  const renderGridLines = () => {
    return (
      <svg 
        width={gridWidth} 
        height={gridHeight} 
        className="absolute top-0 left-0"
        style={{ pointerEvents: 'none' }}
      >
        {/* Vertikální čáry - na pozicích průsečíků */}
        {Array.from({ length: level.gridSize }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * cellSize}
            y1={0}
            x2={i * cellSize}
            y2={gridHeight}
            stroke={ROBOT_COLORS.GRID_LINES}
            strokeWidth="2"
          />
        ))}
        
        {/* Horizontální čáry - na pozicích průsečíků */}
        {Array.from({ length: level.gridSize }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * cellSize}
            x2={gridWidth}
            y2={i * cellSize}
            stroke={ROBOT_COLORS.GRID_LINES}
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  };

  const renderPathLine = () => {
    if (robotTrail.length < 2) return null;
    
    return (
      <svg 
        width={gridWidth} 
        height={gridHeight}
        className="absolute top-0 left-0"
        style={{ pointerEvents: 'none', zIndex: 3 }}
      >
        <path
          d={robotTrail.reduce((path, pos, index) => {
            // Pozice na průsečících - bez offsetu
            const x = pos.x * cellSize;
            const y = pos.y * cellSize;
            
            if (index === 0) {
              return `M ${x} ${y}`;
            } else {
              return `${path} L ${x} ${y}`;
            }
          }, '')}
          stroke={ROBOT_COLORS.TRAIL}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderCollectiblePoints = () => {
    if (!levelCollectiblePoints || levelCollectiblePoints.length === 0) return null;

    // Barevná paleta pro různá čísla
    const numberColors = [
      { bg: '#4A90E2', border: '#2E5C8A', text: '#FFFFFF' }, // 1: Modrá
      { bg: '#E85D75', border: '#B83B4F', text: '#FFFFFF' }, // 2: Červená
      { bg: '#50C878', border: '#2E7D4E', text: '#FFFFFF' }, // 3: Zelená
      { bg: '#9B59B6', border: '#6C3483', text: '#FFFFFF' }, // 4: Fialová
      { bg: '#F39C12', border: '#C87F0A', text: '#FFFFFF' }, // 5: Oranžová
      { bg: '#1ABC9C', border: '#148F77', text: '#FFFFFF' }, // 6: Tyrkysová
      { bg: '#E74C3C', border: '#C0392B', text: '#FFFFFF' }, // 7: Tmavě červená
      { bg: '#3498DB', border: '#2874A6', text: '#FFFFFF' }, // 8: Světle modrá
    ];

    return (
      <>
        {levelCollectiblePoints.map((point, index) => {
          const pointId = `${point.x}-${point.y}-${point.number}`;
          const isAnimating = animatingPointId === pointId;
          
          // Vybrat barvu podle čísla (cyklicky)
          const colorIndex = (point.number - 1) % numberColors.length;
          const colors = numberColors[colorIndex];
          
          // Větší velikost pro vyšší úrovně
          const baseSize = 60;
          const animatedSize = 90;
          const baseFontSize = 28;
          const animatedFontSize = 38;
          
          return (
            <div
              key={`point-${index}`}
              className={`absolute flex items-center justify-center transition-all duration-300 ${
                isAnimating ? 'collectPoint' : ''
              }`}
              style={{
                left: `${point.x * cellSize - baseSize / 2}px`,
                top: `${point.y * cellSize - baseSize / 2}px`,
                width: isAnimating ? `${animatedSize}px` : `${baseSize}px`,
                height: isAnimating ? `${animatedSize}px` : `${baseSize}px`,
                backgroundColor: point.collected ? '#90EE90' : colors.bg,
                border: `4px solid ${point.collected ? '#2E7D32' : colors.border}`,
                borderRadius: '50%',
                zIndex: 4,
                opacity: point.collected ? 0.5 : 1.0,
                transform: isAnimating ? 'scale(1.5)' : 'scale(1)',
                filter: isAnimating ? `brightness(1.5) drop-shadow(0 0 20px ${colors.border})` : 'none',
                marginLeft: isAnimating ? `${-(animatedSize - baseSize) / 2}px` : '0px',
                marginTop: isAnimating ? `${-(animatedSize - baseSize) / 2}px` : '0px',
                transition: 'all 0.3s ease-in-out',
                boxShadow: point.collected ? 'none' : `0 4px 8px rgba(0, 0, 0, 0.2)`
              }}
            >
              <span 
                className="font-bold"
                style={{ 
                  fontSize: isAnimating ? `${animatedFontSize}px` : `${baseFontSize}px`,
                  color: point.collected ? '#2E7D32' : colors.text,
                  transition: 'font-size 0.3s ease-in-out',
                  textShadow: point.collected ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                {point.number}
              </span>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="select-none w-full h-full flex items-center justify-center">
      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: `${gridWidth + 32}px`,
          height: `${gridHeight + 32}px`,
          backgroundColor: ROBOT_COLORS.GRID_BACKGROUND,
          border: `3px solid ${ROBOT_COLORS.PANEL_BORDER}`,
          borderRadius: '12px',
        }}
      >
        <div 
          className="relative"
          style={{ 
            width: `${gridWidth}px`,
            height: `${gridHeight}px`,
          }}
        >
        {/* Čáry mřížky */}
        {renderGridLines()}
        
        {/* Stopa robota - tlustá modrá čára */}
        {renderPathLine()}
        
        {/* Sběratelné body */}
        {renderCollectiblePoints()}
        
          {/* Robot - na průsečíku - zvětšeno o 50% */}
          <div
            className={`absolute flex items-center justify-center transition-all duration-300 ${
              isSuccessAnimating ? 'robotCelebrate' : ''
            }`}
            style={{
              left: `${robotPosition.x * cellSize - 54}px`,
              top: `${robotPosition.y * cellSize - 54}px`,
              width: '108px',
              height: '108px',
              zIndex: 10,
              filter: isSuccessAnimating ? 'brightness(1.3) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'none'
            }}
          >
            <RobotIcon size={108} />
          </div>
          
          {/* Cíl - na průsečíku */}
          <div
            className={`absolute flex items-center justify-center transition-all duration-300 ${
              isSuccessAnimating ? 'goalReached' : ''
            }`}
            style={{
              left: `${level.targetX * cellSize - cellSize * 0.25}px`,
              top: `${level.targetY * cellSize - cellSize * 0.25}px`,
              width: `${cellSize * 0.5}px`,
              height: `${cellSize * 0.5}px`,
              backgroundColor: ROBOT_COLORS.TARGET,
              borderRadius: '50%',
              border: `3px solid #2E7D32`,
              zIndex: 5
            }}
          >
            {level.collectiblePoints && level.collectiblePoints.length > 0 ? (
              <span 
                className="font-bold text-white"
                style={{ fontSize: `${cellSize * 0.25}px` }}
              >
                {level.collectiblePoints.length + 1}
              </span>
            ) : (
              <span className="text-white" style={{ fontSize: `${cellSize * 0.2}px` }}>🎯</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}