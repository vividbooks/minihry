import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion, AnimatePresence } from 'motion/react';
import { isTouchDevice, ScreenSize, updateScreenSize } from '../utils/deviceDetection';
import { COLORS } from '../constants/patternSequenceConstants';
import { generatePatternVariant } from '../utils/patternSequenceUtils';
import { DraggablePattern } from './PatternSequence/DraggablePattern';
import { DropSlot } from './PatternSequence/DropSlot';
import { GameResultScreen } from './GameResultScreen';
import { useAudio } from './AudioManager';
import { 
  DifficultyLevel, 
  PatternElement, 
  Position, 
  PatternSpec, 
  PatternSequenceGameProps 
} from './PatternSequence/types';

// Typ pro hromádku prvků s pozicemi navrstvení
interface ElementStack {
  element: PatternElement;
  stackPositions: Array<{ x: number; y: number; rotation: number; opacity: number }>;
}

export function PatternSequenceGame({ settings = {}, onSwitchGame }: PatternSequenceGameProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(settings.difficulty || 'easy');
  const [currentSpec, setCurrentSpec] = useState<PatternSpec>();
  const [userAnswers, setUserAnswers] = useState<Record<string, PatternElement | null>>({});
  const [elementStacks, setElementStacks] = useState<ElementStack[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [showGameResult, setShowGameResult] = useState(false);
  const [lastAnswerWasCorrect, setLastAnswerWasCorrect] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  
  // Ref pro zabránění duplicitních overlay
  const processingCompletion = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { playSound } = useAudio();

  // Screen size detection
  useEffect(() => {
    return updateScreenSize(setScreenSize);
  }, []);

  // Responzivní velikosti
  const slotSize = useMemo(() => {
    if (!currentSpec) return 80;
    
    const maxCols = Math.max(...currentSpec.pattern.map(row => row.length));
    const availableWidth = window.innerWidth - 40;
    const gapSize = screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 4 : 6;
    const totalGapWidth = (maxCols - 1) * gapSize;
    const maxSlotWidth = Math.floor((availableWidth - totalGapWidth) / maxCols);
    
    const maxSize = screenSize === 'mobile' ? 60 : screenSize === 'tablet' ? 80 : 100;
    const minSize = screenSize === 'mobile' ? 40 : screenSize === 'tablet' ? 50 : 60;
    
    return Math.max(minSize, Math.min(maxSize, maxSlotWidth));
  }, [currentSpec, screenSize]);

  // Generování nové varianty
  const generateNewVariant = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    processingCompletion.current = false;
    
    const spec = generatePatternVariant(difficulty, settings.customPatterns || '', settings.patternTypes || []);
    setCurrentSpec(spec);
    setIsComplete(false);
    setShowSuccess(false);
    setShowGameResult(false);
    setLastAnswerWasCorrect(false);
  }, [difficulty, settings.customPatterns, settings.patternTypes]);

  // Inicializace a reset při změně spec
  useEffect(() => {
    if (!currentSpec) return;
    
    const missing = currentSpec.missing;
    
    // Vytvoření nekonečných hromádek - všechny unikátní kombinace tvarů a barev z vzoru
    const uniqueElements = new Map<string, PatternElement>();
    
    currentSpec.pattern.forEach(row => {
      row.forEach(element => {
        const key = `${element.shape}-${element.color}`;
        if (!uniqueElements.has(key)) {
          uniqueElements.set(key, element);
        }
      });
    });
    
    // Pro každou hromádku generuj 5-7 kartiček s random pozicemi
    const stacks: ElementStack[] = Array.from(uniqueElements.values()).map(element => {
      const numCards = 5 + Math.floor(Math.random() * 3); // 5-7 kartiček
      const stackPositions = [];
      
      for (let i = 0; i < numCards; i++) {
        // Postupné rozházení - čím spodnější, tím větší posun a menší opacity
        const baseOffset = i * 3; // Základní posun pro každou vrstvu
        stackPositions.push({
          x: baseOffset + (Math.random() * 6 - 3), // Random posun ±3px
          y: baseOffset + (Math.random() * 6 - 3),
          rotation: Math.random() * 20 - 10, // Rotace ±10°
          opacity: 1 - (i * 0.12) // Postupně transparentnější
        });
      }
      
      return {
        element,
        stackPositions
      };
    });
    
    setElementStacks(stacks);
    
    // Reset odpovědí
    const initialAnswers: Record<string, PatternElement | null> = {};
    missing.forEach(pos => {
      initialAnswers[`${pos.row}-${pos.col}`] = null;
    });
    setUserAnswers(initialAnswers);
    
    setShowGameResult(false);
    setLastAnswerWasCorrect(false);
    processingCompletion.current = false;
  }, [currentSpec, screenSize]);

  // Inicializace při prvním načtení
  useEffect(() => {
    setShowGameResult(false);
    setLastAnswerWasCorrect(false);
    processingCompletion.current = false;
    generateNewVariant();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup při unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Drop handler - prvek se neodebere z hromádky (nekonečný)
  const handleDrop = useCallback((slotKey: string, element: PatternElement, stackIndex: number) => {
    if (processingCompletion.current) return;
    
    setUserAnswers(prev => ({ ...prev, [slotKey]: element }));
  }, []);

  // Remove handler
  const handleRemoveElement = useCallback((slotKey: string) => {
    if (processingCompletion.current) return;
    
    const removedElement = userAnswers[slotKey];
    if (removedElement) {
      setUserAnswers(prev => ({ ...prev, [slotKey]: null }));
    }
  }, [userAnswers]);

  // Kontrola dokončení
  useEffect(() => {
    if (!currentSpec || Object.keys(userAnswers).length === 0 || currentSpec.missing.length === 0) return;
    
    if (processingCompletion.current) return;
    
    const allFilled = currentSpec.missing.every(missing => 
      userAnswers[`${missing.row}-${missing.col}`] !== null && 
      userAnswers[`${missing.row}-${missing.col}`] !== undefined
    );
    
    if (allFilled) {
      processingCompletion.current = true;
      
      const allCorrect = currentSpec.missing.every(missing => {
        const expectedElement = currentSpec.pattern[missing.row][missing.col];
        const userElement = userAnswers[`${missing.row}-${missing.col}`];
        return userElement && expectedElement &&
          userElement.shape === expectedElement.shape &&
          userElement.color === expectedElement.color;
      });
      
      if (allCorrect) {
        setLastAnswerWasCorrect(true);
        setShowGameResult(true);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setShowGameResult(false);
          setIsComplete(true);
          setCurrentRound(prev => prev + 1);
          timeoutRef.current = setTimeout(() => {
            setIsComplete(false);
            generateNewVariant();
          }, 500);
        }, 3000);
      } else {
        setLastAnswerWasCorrect(false);
        setShowGameResult(true);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setShowGameResult(false);
          processingCompletion.current = false;
        }, 3000);
      }
    }
  }, [userAnswers, currentSpec, playSound, generateNewVariant]);

  // Progress calculation
  const progress = useMemo(() => {
    if (!currentSpec) return 0;
    const filledCorrect = currentSpec.missing.filter(missing => {
      const expectedElement = currentSpec.pattern[missing.row][missing.col];
      const userElement = userAnswers[`${missing.row}-${missing.col}`];
      return userElement && expectedElement &&
        userElement.shape === expectedElement.shape &&
        userElement.color === expectedElement.color;
    }).length;
    return (filledCorrect / currentSpec.missing.length) * 100;
  }, [userAnswers, currentSpec]);

  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  if (!currentSpec) {
    return <div>Načítání...</div>;
  }

  return (
    <DndProvider backend={backend}>
      <div className="w-full h-screen flex flex-col justify-center" style={{ backgroundColor: COLORS.PAGE_BG }}>
        {/* Header - výraznější a posun dolů */}
        <div className="w-full pt-6 pb-4 px-4" style={{ backgroundColor: COLORS.PAGE_BG }}>
          <div className="flex flex-col items-center space-y-3 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-[#4e5871] text-center" style={{ letterSpacing: '0.02em' }}>
              Doplň vzor
            </h1>
            
            <div className="flex items-center justify-between w-full max-w-3xl mt-2">
              <div className="text-lg md:text-xl font-bold text-[#4e5871] flex-1 text-left">
                Kolo {currentRound}
              </div>
              
              <div className="flex-1 flex justify-center">
                {!isComplete && (
                  <div className="w-28 sm:w-36 md:w-44 rounded-full h-3 bg-gray-300">
                    <div className="h-3 rounded-full transition-all duration-300"
                         style={{
                           backgroundColor: COLORS.GREEN,
                           width: `${progress}%`
                         }} />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 flex-1 justify-end">
                <button 
                  onClick={generateNewVariant} 
                  className="rounded-lg transition-all shadow-lg text-sm px-3 py-2"
                  style={{ 
                    backgroundColor: COLORS.PURPLE, 
                    color: 'white', 
                    fontWeight: 'bold'
                  }}
                >
                  🎲 Nový
                </button>
                
                {onSwitchGame && (
                  <button 
                    onClick={onSwitchGame} 
                    className="rounded-lg transition-all shadow-lg text-sm px-3 py-2"
                    style={{ 
                      backgroundColor: COLORS.BLUE, 
                      color: 'white', 
                      fontWeight: 'bold'
                    }}
                  >
                    🔶 Čísla
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hlavní herní oblast - VERTIKÁLNĚ VYCENTROVANÁ */}
        <div className="flex-1 flex flex-col justify-center px-4 py-4" style={{ overflow: 'visible' }}>
          {/* VZOR */}
          <div className="pb-6">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              {currentSpec.pattern.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4"
                >
                  {row.map((element, colIndex) => {
                    const slotKey = `${rowIndex}-${colIndex}`;
                    const isMissing = currentSpec.missing.some(pos => pos.row === rowIndex && pos.col === colIndex);
                    
                    return (
                      <DropSlot
                        key={slotKey}
                        slotKey={slotKey}
                        element={isMissing ? userAnswers[slotKey] : element}
                        expectedElement={element}
                        onDrop={handleDrop}
                        onRemove={handleRemoveElement}
                        size={slotSize}
                        isComplete={isComplete}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* NEKONEČNÉ HROMÁDKY - pod vzorem, 200px od sebe */}
          <div className="flex items-center justify-center py-6 overflow-x-auto" style={{ overflow: 'visible' }}>
            <div 
              className="flex items-center justify-center flex-wrap"
              style={{ 
                gap: '200px',
                maxWidth: '100%',
                padding: '0 20px',
                overflow: 'visible'
              }}
            >
              {elementStacks.map((stack, stackIndex) => (
                <div 
                  key={`stack-${stackIndex}`} 
                  className="flex flex-col items-center relative"
                  style={{ 
                    minWidth: `${slotSize * 0.9 + 70}px`,
                    overflow: 'visible'
                  }}
                >
                  {/* HROMÁDKA - kartičky STEJNÉ VELIKOSTI */}
                  <div 
                    className="relative"
                    style={{
                      width: slotSize * 0.9 + 70,
                      height: slotSize * 0.9 + 70,
                      marginBottom: '10px',
                      overflow: 'visible'
                    }}
                  >
                    {/* Vrstva kartiček pod hlavní kartičkou - STEJNÁ VELIKOST! */}
                    {stack.stackPositions.slice(1).reverse().map((pos, index) => (
                      <div
                        key={`shadow-${index}`}
                        className="absolute pointer-events-none"
                        style={{
                          left: `${35 + pos.x}px`,
                          top: `${35 + pos.y}px`,
                          width: slotSize * 0.9,
                          height: slotSize * 0.9,
                          transform: `rotate(${pos.rotation}deg)`,
                          opacity: pos.opacity,
                          zIndex: index,
                          overflow: 'visible'
                        }}
                      >
                        {/* Kompletní kartička se symbolem - STEJNÁ JAKO HORNÍ */}
                        <DraggablePattern
                          element={stack.element}
                          originalIndex={-1}
                          onDrop={() => {}}
                          size={Math.floor(slotSize * 0.9)}
                          style={{ pointerEvents: 'none', overflow: 'visible' }}
                        />
                      </div>
                    ))}
                    
                    {/* HORNÍ táhnutelná kartička */}
                    <div
                      className="absolute"
                      style={{
                        left: `${35 + stack.stackPositions[0].x}px`,
                        top: `${35 + stack.stackPositions[0].y}px`,
                        width: slotSize * 0.9,
                        height: slotSize * 0.9,
                        transform: `rotate(${stack.stackPositions[0].rotation}deg)`,
                        zIndex: 100,
                        filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))',
                        overflow: 'visible'
                      }}
                    >
                      <DraggablePattern
                        element={stack.element}
                        originalIndex={stackIndex}
                        onDrop={() => {}}
                        size={Math.floor(slotSize * 0.9)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay s videi - POLOPRŮHLEDNÉ, kupičky viditelné pod ním */}
        <AnimatePresence>
          {showGameResult && (
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
              <GameResultScreen
                isSuccess={lastAnswerWasCorrect}
                onContinue={() => {
                  setShowGameResult(false);
                  if (!lastAnswerWasCorrect) {
                    processingCompletion.current = false;
                  }
                }}
                autoHideDuration={3}
                successText={lastAnswerWasCorrect ? 
                  ['Skvělé! 🎯', 'Výborně! ⭐', 'Perfektní! 🏆', 'Úžasné! 🌟'][Math.floor(Math.random() * 4)] :
                  undefined
                }
                failureText={!lastAnswerWasCorrect ? 
                  ['Zkus to znovu! 🤔', 'Málem! 💪', 'Další pokus! 🎲', 'Zvládneš to! 🌟'][Math.floor(Math.random() * 4)] :
                  undefined
                }
                showContinueButton={false}
                displayType="gameComplete"
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}
