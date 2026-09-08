import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GameFeedback } from './GameFeedback';
import { Button } from './ui/button';

interface CountingGameProps {
  settings?: {
    backgroundColor?: string;
    gameModes?: string[];
    numberRange?: [number, number];
    environments?: ('kuličky' | 'fazole' | 'knoflíky')[];
    autoIntroVideo?: boolean;
    isDirectPlay?: boolean;
  };
}

export function CountingGame({ settings = {} }: CountingGameProps) {
  const {
    backgroundColor = '#FFF8CD',
    gameModes = ['lines', 'numbers'],
    numberRange = [0, 20],
    environments = ['kuličky', 'fazole', 'knoflíky'],
    autoIntroVideo = true,
    isDirectPlay = false,
  } = settings;

  const [inBox, setInBox] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [total, setTotal] = useState(4);
  const [onTable, setOnTable] = useState(2);
  const [buttonPositions, setButtonPositions] = useState<{left: number, top: number}[]>([]);
  const [buttonRotations, setButtonRotations] = useState<number[]>([]);
  const [objectType, setObjectType] = useState<'kuličky' | 'fazole' | 'knoflíky'>('kuličky');
  const [ballColor, setBallColor] = useState<'zelena' | 'zluta'>('zelena');
  const [bagColor, setBagColor] = useState<'zelena' | 'zluty'>('zelena');
  const [showIntro, setShowIntro] = useState(autoIntroVideo);
  const [gameMode, setGameMode] = useState<'numbers' | 'lines'>('lines');
  const [initialized, setInitialized] = useState(false);
  const [userSelectedMode, setUserSelectedMode] = useState(false);
  const [showGameFeedback, setShowGameFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  
  const initializingRef = useRef(false);
  const generatingRef = useRef(false);
  const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const correctAnswer = total - onTable;

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getScaleFactor = () => {
    const baseHeight = 800;
    const minHeight = 600;
    const maxHeight = 1200;
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, screenHeight));
    return (clampedHeight / baseHeight) * 0.85;
  };

  const scaleFactor = getScaleFactor();
  
  const getColoredObjectImage = () => {
    if (objectType === 'kuličky') {
      return `https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kulicka_${ballColor}.svg`;
    }
    return objectTypes[objectType].objectImage;
  };

  const getColoredContainerImage = () => {
    if (objectType === 'kuličky') {
      return `https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/pitlik_${bagColor}.svg`;
    }
    return objectTypes[objectType].containerImage;
  };

  const objectTypes = {
    kuličky: {
      name: 'kulička',
      namePlural: 'kuličky',
      namePluralMany: 'kuliček',
      objectImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/kulicka.svg',
      containerImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/pitlik.svg',
      containerName: 'pytlíku',
      containerSize: { width: 576, height: 384 },
      containerPosition: { left: 450, top: 40 },
      objectSizeTable: { width: 60, height: 60 },
      objectSizeTitle: { width: 72, height: 72 }
    },
    fazole: {
      name: 'fazole',
      namePlural: 'fazole',
      namePluralMany: 'fazolí',
      objectImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/fazole.svg',
      containerImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/ruka.svg',
      containerName: 'ruce',
      containerSize: { width: 487, height: 326 },
      containerPosition: { left: 550, top: 80 },
      objectSizeTable: { width: 120, height: 120 },
      objectSizeTitle: { width: 144, height: 144 }
    },
    knoflíky: {
      name: 'knoflík',
      namePlural: 'knoflíky',
      namePluralMany: 'knoflíků',
      objectImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/knoflik.svg',
      containerImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/truhla.svg',
      containerName: 'truhle',
      containerSize: { width: 320, height: 240 },
      containerPosition: { left: 570, top: 120 },
      objectSizeTable: { width: 80, height: 80 },
      objectSizeTitle: { width: 96, height: 96 }
    }
  };
  
  const currentType = objectTypes[objectType];
  
  const generateRandomPositions = (count: number) => {
    const positions: {left: number, top: number}[] = [];
    const rotations: number[] = [];
    
    const isMobile = window.innerWidth < 768;
    let tableLeftStart, tableLeftEnd, tableTop, tableBottom;
    
    if (isMobile) {
      tableLeftStart = 30;
      tableLeftEnd = window.innerWidth - 60;
      tableTop = 30;
      tableBottom = 180;
    } else {
      tableLeftStart = 230;
      tableLeftEnd = 530;
      tableTop = 250;
      tableBottom = 550;
    }
    
    const buttonSize = Math.max(currentType.objectSizeTable.width, currentType.objectSizeTable.height);
    let minGap = buttonSize >= 140 ? 160 : buttonSize >= 120 ? 140 : buttonSize >= 80 ? 120 : 100;
    
    const gridCols = 3;
    const gridRows = 3;
    const cellWidth = (tableLeftEnd - tableLeftStart) / gridCols;
    const cellHeight = (tableBottom - tableTop) / gridRows;
    
    const gridPositions: {left: number, top: number}[] = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const cellCenterX = tableLeftStart + col * cellWidth + cellWidth / 2;
        const cellCenterY = tableTop + row * cellHeight + cellHeight / 2;
        const offsetX = (Math.random() - 0.5) * (cellWidth * 0.4);
        const offsetY = (Math.random() - 0.5) * (cellHeight * 0.4);
        gridPositions.push({
          left: cellCenterX + offsetX - buttonSize / 2,
          top: cellCenterY + offsetY - buttonSize / 2
        });
      }
    }
    
    for (let i = gridPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
    }
    
    for (let i = 0; i < Math.min(count, gridPositions.length); i++) {
      positions.push(gridPositions[i]);
      rotations.push(0);
    }
    
    setButtonRotations(rotations);
    return positions;
  };

  const getRandomObjectType = () => {
    const availableTypes = environments.length > 0 ? environments : ['kuličky', 'fazole', 'knoflíky'];
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  };

  const generateNewExample = useCallback(() => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    
    const randomObjectType = getRandomObjectType();
    
    if (randomObjectType === 'kuličky') {
      const ballColors: ('zelena' | 'zluta')[] = ['zelena', 'zluta'];
      const bagColors: ('zelena' | 'zluty')[] = ['zelena', 'zluty'];
      setBallColor(ballColors[Math.floor(Math.random() * ballColors.length)]);
      setBagColor(bagColors[Math.floor(Math.random() * bagColors.length)]);
    }
    
    const [minNum, maxNum] = numberRange;
    let newTotal, newOnTable;
    
    if (gameMode === 'lines') {
      // Pro čárky používáme menší čísla
      newTotal = Math.floor(Math.random() * Math.min(4, maxNum - minNum)) + Math.max(3, minNum);
      // Zajistíme, aby na stole bylo aspoň 1 a maximálně newTotal - 1 (aby v pytlíku bylo aspoň 1)
      // A také maximálně 9, protože máme jen 9 pozic v mřížce
      const maxPossibleOnTable = Math.min(newTotal - 1, 9);
      newOnTable = Math.floor(Math.random() * maxPossibleOnTable) + 1;
    } else {
      newTotal = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      // Na stole může být 0 až newTotal, ale maximálně 9 (kapacita mřížky)
      const maxPossibleOnTable = Math.min(newTotal, 9);
      newOnTable = Math.floor(Math.random() * (maxPossibleOnTable + 1));
    }
    
    setTotal(newTotal);
    setOnTable(newOnTable);
    setObjectType(randomObjectType);
    
    const positions = generateRandomPositions(newOnTable);
    setButtonPositions(positions);
    
    generatingRef.current = false;
  }, [gameMode, numberRange, environments]);

  useEffect(() => {
    if (!initialized && !initializingRef.current) {
      initializingRef.current = true;
      if (gameModes.length > 0) {
        const randomMode = gameModes[Math.floor(Math.random() * gameModes.length)] as 'numbers' | 'lines';
        setGameMode(randomMode);
      }
      setInitialized(true);
      initializingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (showIntro && autoIntroVideo) {
      introTimeoutRef.current = setTimeout(() => setShowIntro(false), 4000);
      return () => {
        if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
      };
    }
  }, [showIntro, autoIntroVideo]);

  useEffect(() => {
    if (initialized && gameMode && !generatingRef.current) {
      generateNewExample();
    }
  }, [initialized, gameMode]);

  const increment = () => {
    if (!isAnswered) setInBox(inBox + 1);
  };

  const decrement = () => {
    if (inBox > 0 && !isAnswered) setInBox(inBox - 1);
  };

  const checkAnswer = () => {
    setIsAnswered(true);
    const isCorrect = inBox === correctAnswer;
    setLastAnswerCorrect(isCorrect);
    setShowGameFeedback(true);
  };

  const handleIntroClick = () => {
    if (introTimeoutRef.current) {
      clearTimeout(introTimeoutRef.current);
      introTimeoutRef.current = null;
    }
    setShowIntro(false);
  };

  const onFeedbackComplete = useCallback(() => {
    setShowGameFeedback(false);
    setInBox(0);
    setIsAnswered(false);
    
    if (!isDirectPlay && gameModes.length > 1 && !userSelectedMode) {
      const currentModeIndex = gameModes.indexOf(gameMode);
      let availableModes = gameModes.filter((mode, index) => index !== currentModeIndex);
      
      if (availableModes.length > 0) {
        const randomMode = availableModes[Math.floor(Math.random() * availableModes.length)] as 'numbers' | 'lines';
        setGameMode(randomMode);
      } else {
        setTimeout(() => {
          if (!generatingRef.current) generateNewExample();
        }, 100);
      }
    } else {
      setTimeout(() => {
        if (!generatingRef.current) generateNewExample();
      }, 100);
    }
  }, [isDirectPlay, gameModes, userSelectedMode, gameMode, generateNewExample]);

  const CurvedLines = ({ count, size = 'normal' }: { count: number, size?: 'normal' | 'large' }) => {
    const lineHeight = size === 'large' ? 81 : 55;
    const lineWidth = 3.9;
    const spacing = size === 'large' ? 16 : 10;
    
    return (
      <div className="flex items-center gap-1" style={{ gap: `${spacing}px` }}>
        {Array.from({ length: count }).map((_, i) => (
          <svg
            key={i}
            width={lineWidth + 4}
            height={lineHeight}
            viewBox={`0 0 ${lineWidth + 4} ${lineHeight}`}
            className="flex-shrink-0"
          >
            <path
              d={`M ${(lineWidth + 4) / 2} 4 Q ${(lineWidth + 4) / 2 + 2} ${lineHeight / 2} ${(lineWidth + 4) / 2} ${lineHeight - 4}`}
              stroke="#03036a"
              strokeWidth={lineWidth}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ))}
      </div>
    );
  };

  if (showIntro) {
    return (
      <div className="min-h-screen w-full relative" style={{ backgroundColor: '#FBF3E6' }}>
        <button
          onClick={handleIntroClick}
          className="fixed top-4 right-4 z-50 bg-white/80 hover:bg-white text-[#03036a] px-3 py-2 rounded-lg shadow-lg border border-[#03036a]/20 flex items-center gap-2 transition-all hover:scale-105 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          Přeskočit
        </button>

        <div className="hidden md:flex min-h-screen">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="cursor-pointer object-contain ml-8"
              onClick={handleIntroClick}
              style={{ width: '72%', maxHeight: '70vh' }}
            >
              <source src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/pitlik.mp4" type="video/mp4" />
            </video>
          </div>
          
          <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={handleIntroClick}>
            <div className="text-[#03036a] text-[120px] uppercase text-center">
              Zjisti
            </div>
          </div>
        </div>

        <div className="md:hidden flex flex-col min-h-screen">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="cursor-pointer object-contain ml-4"
              onClick={handleIntroClick}
              style={{ width: '84%', maxHeight: '40vh' }}
            >
              <source src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/objekty/pitlik.mp4" type="video/mp4" />
            </video>
          </div>
          
          <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={handleIntroClick}>
            <div className="text-[#03036a] text-[64px] uppercase text-center">
              Zjisti
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ backgroundColor }}>
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-center min-h-screen relative">
        <div 
          className="relative"
          style={{
            width: `min(100vw, ${1200 * scaleFactor}px)`,
            height: `min(100vh, ${800 * scaleFactor}px)`,
            maxWidth: '100vw',
            maxHeight: '100vh'
          }}
        >
          
          {isDirectPlay && (
            <div className="absolute z-10" style={{ 
              top: `${10 * scaleFactor}px`, 
              right: `${10 * scaleFactor}px`,
              gap: `${8 * scaleFactor}px`,
              display: 'flex'
            }}>
              {gameModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setGameMode(mode as any);
                    setUserSelectedMode(true);
                  }}
                  className="transition-colors"
                  style={{
                    padding: `${12 * scaleFactor}px ${16 * scaleFactor}px`,
                    borderRadius: `${8 * scaleFactor}px`,
                    fontSize: `${12 * scaleFactor}px`,
                    backgroundColor: gameMode === mode ? '#03036a' : 'white',
                    color: gameMode === mode ? 'white' : '#03036a',
                    border: gameMode === mode ? 'none' : `1px solid #03036a`
                  }}
                >
                  {mode === 'lines' ? 'Čárky' : 'Čísla'}
                </button>
              ))}
            </div>
          )}

          <div 
            className="absolute leading-[0] not-italic text-[#03036a] text-nowrap uppercase flex items-center"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              top: `${10 * scaleFactor}px`,
              fontSize: `${62 * scaleFactor}px`,
              gap: `${20 * scaleFactor}px`
            }}
          >
            {gameMode === 'numbers' ? (
              <p style={{ lineHeight: `${91 * scaleFactor}px` }}>mám {total}</p>
            ) : (
              <div className="flex items-center" style={{ gap: `${16 * scaleFactor}px` }}>
                <p style={{ lineHeight: `${91 * scaleFactor}px` }}>mám</p>
                <div className="flex items-center" style={{ gap: `${16 * scaleFactor}px` }}>
                  {Array.from({ length: total }).map((_, i) => (
                    <svg
                      key={i}
                      width={`${7.9 * scaleFactor}px`}
                      height={`${81 * scaleFactor}px`}
                      viewBox={`0 0 7.9 81`}
                      className="flex-shrink-0"
                    >
                      <path
                        d="M 3.95 4 Q 5.95 40.5 3.95 77"
                        stroke="#03036a"
                        strokeWidth={3.9}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  ))}
                </div>
              </div>
            )}
            <div 
              className="flex-shrink-0"
              style={{
                width: `${currentType.objectSizeTitle.width * scaleFactor}px`,
                height: `${currentType.objectSizeTitle.height * scaleFactor}px`
              }}
            >
              <ImageWithFallback
                src={getColoredObjectImage()}
                alt={currentType.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <>
            <div 
              className="absolute bg-[#755838] rounded-[26px] shadow-lg"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${820 * scaleFactor}px`,
                height: `${388 * scaleFactor}px`,
                top: `${220 * scaleFactor}px`,
                borderRadius: `${26 * scaleFactor}px`
              }}
            />
            <div 
              className="absolute bg-orange-50 shadow-xl"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${820 * scaleFactor}px`,
                height: `${388 * scaleFactor}px`,
                top: `${210 * scaleFactor}px`,
                borderRadius: `${26 * scaleFactor}px`
              }}
            />
            
            <div 
              className="absolute"
              style={{
                left: `${currentType.containerPosition.left * scaleFactor}px`,
                top: `${currentType.containerPosition.top * scaleFactor}px`,
                width: `${currentType.containerSize.width * scaleFactor}px`,
                height: `${currentType.containerSize.height * scaleFactor}px`
              }}
            >
              <ImageWithFallback
                src={getColoredContainerImage()}
                alt={currentType.containerName}
                className="w-full h-full object-contain"
              />
            </div>
            
            {buttonPositions.map((position, i) => (
              <div 
                key={i}
                className="absolute"
                style={{
                  left: `${position.left * scaleFactor}px`,
                  top: `${position.top * scaleFactor}px`,
                  width: `${currentType.objectSizeTable.width * scaleFactor}px`,
                  height: `${currentType.objectSizeTable.height * scaleFactor}px`,
                  transform: `rotate(${buttonRotations[i] || 0}deg)`
                }}
              >
                <ImageWithFallback
                  src={getColoredObjectImage()}
                  alt={currentType.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </>
          
          <div className="absolute left-[50%] transform -translate-x-1/2 flex items-center" style={{ top: `${640 * scaleFactor}px`, gap: `${24 * scaleFactor}px` }}>
            <div className="leading-[0] not-italic text-[#03036a] text-nowrap uppercase" style={{ fontSize: `${43 * scaleFactor}px` }}>
              <p style={{ lineHeight: `${64 * scaleFactor}px` }} className="whitespace-pre">V {currentType.containerName.toUpperCase()} JE:</p>
            </div>
            
            <div className={`bg-white border-2 border-[#7e84ca] flex items-center justify-start relative ${gameMode === 'lines' ? 'w-[268px]' : 'w-[218px]'}`} style={{ borderRadius: `${17 * scaleFactor}px`, height: `${152 * scaleFactor}px`, paddingLeft: `${24 * scaleFactor}px`, width: gameMode === 'lines' ? `${268 * scaleFactor}px` : `${218 * scaleFactor}px` }}>
              {gameMode === 'numbers' ? (
                <div className="text-[#03036a] uppercase" style={{ fontSize: `${91 * scaleFactor}px` }}>
                  {inBox}
                </div>
              ) : (
                <div className="flex items-center">
                  <CurvedLines count={inBox} size="large" />
                </div>
              )}
              
              <div className="absolute top-[50%] transform -translate-y-1/2 flex flex-col gap-1" style={{ height: `${121 * scaleFactor}px`, right: `${10 * scaleFactor}px`, gap: `${1 * scaleFactor}px` }}>
                <button
                  onClick={increment}
                  disabled={isAnswered}
                  className="bg-[#e3efff] hover:bg-[#d1e0ff] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ borderRadius: `${3 * scaleFactor}px`, width: `${63 * scaleFactor}px`, height: `${58 * scaleFactor}px` }}
                >
                  <div className="text-[#03036a] leading-none" style={{ fontSize: `${30 * scaleFactor}px` }}>▲</div>
                </button>
                
                <button
                  onClick={decrement}
                  disabled={inBox <= 0 || isAnswered}
                  className="bg-[#e3efff] hover:bg-[#d1e0ff] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ borderRadius: `${3 * scaleFactor}px`, width: `${63 * scaleFactor}px`, height: `${58 * scaleFactor}px` }}
                >
                  <div className="text-[#03036a] leading-none" style={{ fontSize: `${30 * scaleFactor}px` }}>▼</div>
                </button>
              </div>
            </div>
            
            {!isAnswered && (
              <button
                onClick={checkAnswer}
                className="bg-[#1e3a8a] hover:bg-[#1d4ed8] shadow-lg transition-colors flex items-center justify-center"
                style={{ borderRadius: `${32.5 * scaleFactor}px`, width: `${65 * scaleFactor}px`, height: `${65 * scaleFactor}px` }}
              >
                <div className="text-white leading-none" style={{ fontSize: `${40 * scaleFactor}px` }}>&#10003;</div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen p-4">
        {isDirectPlay && (
          <div className="flex justify-center gap-1 mb-4 flex-wrap">
            {gameModes.map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setGameMode(mode as any);
                  setUserSelectedMode(true);
                }}
                className={`px-2 py-2 rounded-lg text-xs transition-colors ${
                  gameMode === mode 
                    ? 'bg-[#03036a] text-white' 
                    : 'bg-white text-[#03036a] border border-[#03036a]'
                }`}
              >
                {mode === 'lines' ? 'Čárky' : 'Čísla'}
              </button>
            ))}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="text-[#03036a] text-[32px] uppercase flex items-center justify-center gap-3">
            {gameMode === 'numbers' ? (
              <span>mám {total}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span>mám</span>
                <CurvedLines count={total} size="normal" />
              </div>
            )}
            <div className="w-12 h-12">
              <ImageWithFallback
                src={getColoredObjectImage()}
                alt={currentType.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="relative mb-4 min-h-[280px]">
            <div className="bg-[#755838] rounded-2xl min-h-[280px] shadow-lg absolute inset-0 top-[10px]"></div>
            <div className="bg-orange-50 rounded-2xl p-4 min-h-[270px] shadow-xl relative">
              
              <div className="absolute top-4 right-4 w-32 h-28">
                <ImageWithFallback
                  src={getColoredContainerImage()}
                  alt={currentType.containerName}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-start items-start h-full pt-2 pr-36">
                {Array.from({ length: onTable }).map((_, i) => (
                  <div 
                    key={i}
                    className="w-16 h-16"
                    style={{
                      transform: `rotate(${buttonRotations[i] || 0}deg)`
                    }}
                  >
                    <ImageWithFallback
                      src={getColoredObjectImage()}
                      alt={currentType.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-[#03036a] text-[32px] uppercase">
              V {currentType.containerName.toUpperCase()} JE:
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className={`bg-white rounded-xl h-[108px] border-2 border-[#7e84ca] flex items-center justify-start relative pl-4 ${gameMode === 'lines' ? 'w-[220px]' : 'w-[180px]'}`}>
            {gameMode === 'numbers' ? (
              <div className="text-[#03036a] text-[56px] uppercase">
                {inBox}
              </div>
            ) : (
              <div className="flex items-center">
                <CurvedLines count={inBox} size="normal" />
              </div>
            )}
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1" style={{ height: '86px' }}>
              <button
                onClick={increment}
                disabled={isAnswered}
                className="bg-[#e3efff] rounded-sm w-16 h-10 hover:bg-[#d1e0ff] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <div className="text-[#03036a] text-[24px] leading-none">▲</div>
              </button>
              
              <button
                onClick={decrement}
                disabled={inBox <= 0 || isAnswered}
                className="bg-[#e3efff] rounded-sm w-16 h-10 hover:bg-[#d1e0ff] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <div className="text-[#03036a] text-[24px] leading-none">▼</div>
              </button>
            </div>
          </div>
          
          {!isAnswered && (
            <button
              onClick={checkAnswer}
              className="bg-[#1e3a8a] hover:bg-[#1d4ed8] rounded-full w-20 h-20 shadow-lg transition-colors flex items-center justify-center"
            >
              <div className="text-white text-[32px] leading-none">&#10003;</div>
            </button>
          )}
        </div>
      </div>
        
      <GameFeedback
        isVisible={showGameFeedback}
        isCorrect={lastAnswerCorrect}
        onComplete={onFeedbackComplete}
      />
    </div>
  );
}
