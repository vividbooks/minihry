import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { useAudio } from './AudioManager';
import { GameResultScreen } from './GameResultScreen';

type GameMode = 'count' | 'complete' | 'complete-number' | 'number-input';

interface GameConfig {
  mode: GameMode;
  leftDots: number;
  rightDots: number;
  hiddenSide?: 'left' | 'right';
  total?: number;
}

interface DominoGameProps {
  settings?: {
    numberRange?: [number, number];
    gameModes?: GameMode[];
    autoModeSwitch?: boolean;
    feedbackDuration?: number;
    maxAttempts?: number;
    enableHints?: boolean;
    backgroundColor?: string;
  };
}

interface Dot {
  id: string;
  x: number;
  y: number;
}

export function DominoGame({ settings = {} }: DominoGameProps) {
  const {
    numberRange = [0, 9],
    gameModes = ['count', 'complete', 'complete-number', 'number-input'],
    autoModeSwitch = true,
    feedbackDuration = 2000,
    maxAttempts = 3,
    enableHints = true,
    backgroundColor = '#F5E6D0'
  } = settings;

  const [currentGame, setCurrentGame] = useState<GameConfig>({
    mode: 'count',
    leftDots: 3,
    rightDots: 3,
  });
  const [clickFieldDots, setClickFieldDots] = useState<Dot[]>([]);
  const [hiddenSideDots, setHiddenSideDots] = useState<Dot[]>([]);
  const [numberInput, setNumberInput] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completedGames, setCompletedGames] = useState(0); // Počítadlo dokončených her
  const [roundInProgress, setRoundInProgress] = useState(false);

  const { playSound } = useAudio();

  // Generování nové hry
  const generateNewGame = useCallback(() => {
    let mode: GameMode;
    
    if (autoModeSwitch) {
      // Náhodně vybrat dostupný mód
      const availableModes = gameModes.filter(m => gameModes.includes(m));
      mode = availableModes[Math.floor(Math.random() * availableModes.length)];
    } else {
      mode = currentGame.mode;
    }

    const leftDots = Math.floor(Math.random() * (numberRange[1] - numberRange[0] + 1)) + numberRange[0];
    const rightDots = Math.floor(Math.random() * (numberRange[1] - numberRange[0] + 1)) + numberRange[0];
    const total = leftDots + rightDots;
    const hiddenSide = Math.random() > 0.5 ? 'left' : 'right';
    
    setCurrentGame({
      mode,
      leftDots,
      rightDots,
      hiddenSide,
      total,
    });
    
    // Reset stavu
    setClickFieldDots([]);
    setHiddenSideDots([]);
    setNumberInput(0);
    setShowCorrectAnswer(false);
    setShowGameComplete(false);
    setAttempts(0);
    setRoundInProgress(false);
  }, [numberRange, gameModes, autoModeSwitch, currentGame.mode]);

  // Inicializace první hry
  useEffect(() => {
    generateNewGame();
  }, []);

  // Handler pro klikání do pole CELKEM
  const handleClickFieldClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (currentGame.mode !== 'count') return;

    const fieldRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - fieldRect.left) / fieldRect.width) * 100;
    const y = ((e.clientY - fieldRect.top) / fieldRect.height) * 100;
    
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(10, Math.min(90, y));
    
    const newDot: Dot = {
      id: Math.random().toString(36).substr(2, 9),
      x: clampedX,
      y: clampedY,
    };

    setClickFieldDots(prev => [...prev, newDot]);
    playSound('click');
  }, [currentGame.mode, playSound]);

  // Handler pro klikání na skrytou stranu domina
  const handleHiddenSideClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (currentGame.mode !== 'complete' && currentGame.mode !== 'complete-number') return;

    const fieldRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - fieldRect.left) / fieldRect.width) * 100;
    const y = ((e.clientY - fieldRect.top) / fieldRect.height) * 100;
    
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(15, Math.min(85, y));
    
    const newDot: Dot = {
      id: Math.random().toString(36).substr(2, 9),
      x: clampedX,
      y: clampedY,
    };

    setHiddenSideDots(prev => [...prev, newDot]);
    playSound('click');
  }, [currentGame.mode, playSound]);

  // Generování vzoru teček pro domino podle dokumentace
  const generateDicePattern = useCallback((count: number) => {
    const patterns: { [key: number]: [number, number][] } = {
      0: [],
      1: [[0, 0]],
      2: [[-30, -30], [30, 30]],
      3: [[-30, -30], [0, 0], [30, 30]],
      4: [[-30, -30], [30, -30], [-30, 30], [30, 30]],
      5: [[-30, -30], [30, -30], [0, 0], [-30, 30], [30, 30]],
      6: [[-30, -25], [-30, 0], [-30, 25], [30, -25], [30, 0], [30, 25]],
      7: [[-30, -25], [-30, 0], [-30, 25], [0, 0], [30, -25], [30, 0], [30, 25]],
      8: [[-30, -25], [-30, 0], [-30, 25], [0, -25], [0, 25], [30, -25], [30, 0], [30, 25]],
      9: [[-30, -25], [0, -25], [30, -25], [-30, 0], [0, 0], [30, 0], [-30, 25], [0, 25], [30, 25]],
    };

    const pattern = patterns[count] || patterns[0];
    
    return pattern.map(([offsetX, offsetY], index) => (
      <circle
        key={`dot-${index}`}
        cx={`${50 + offsetX}%`}
        cy={`${50 + offsetY}%`}
        r="23"
        fill="url(#plasticDotGradient)"
        stroke="#666"
        strokeWidth="0.5"
        filter="url(#dotShadow)"
      />
    ));
  }, []);

  // Kontrola odpovědi s systémem kol
  const checkAnswer = useCallback(() => {
    setAttempts(prev => prev + 1);
    
    let userGuess = 0;
    let correctAnswer = 0;
    let isAnswerCorrect = false;

    if (currentGame.mode === 'count') {
      userGuess = clickFieldDots.length;
      correctAnswer = currentGame.leftDots + currentGame.rightDots;
      isAnswerCorrect = userGuess === correctAnswer;
    } else if (currentGame.mode === 'complete' || currentGame.mode === 'complete-number') {
      userGuess = hiddenSideDots.length;
      const visibleSide = currentGame.hiddenSide === 'left' ? currentGame.rightDots : currentGame.leftDots;
      correctAnswer = (currentGame.total || 0) - visibleSide;
      isAnswerCorrect = userGuess === correctAnswer;
    } else if (currentGame.mode === 'number-input') {
      userGuess = numberInput;
      correctAnswer = currentGame.leftDots + currentGame.rightDots;
      isAnswerCorrect = userGuess === correctAnswer;
    }

    if (isAnswerCorrect) {
      // Zobrazit "SPRÁVNĚ!" overlay
      setShowCorrectAnswer(true);
      setRoundInProgress(true);
      
      setTimeout(() => {
        setShowCorrectAnswer(false);
        setCompletedGames(prev => prev + 1);
        
        // Zkontrolovat, zda jsme dokončili kolo (10 her)
        if (completedGames + 1 >= 10) {
          setShowGameComplete(true);
          setCompletedGames(0); // Reset pro nové kolo
        } else {
          generateNewGame();
        }
        setRoundInProgress(false);
      }, 1500);
    } else {
      // Zobrazit "ZKUS TO ZNOVU!" overlay
      setShowCorrectAnswer(true);
      
      setTimeout(() => {
        setShowCorrectAnswer(false);
        if (attempts + 1 >= maxAttempts) {
          setCompletedGames(prev => prev + 1);
          
          // I při neúspěchu počítáme do kola
          if (completedGames + 1 >= 10) {
            setShowGameComplete(true);
            setCompletedGames(0);
          } else {
            generateNewGame();
          }
        }
      }, 1500);
    }
  }, [currentGame, clickFieldDots.length, hiddenSideDots.length, numberInput, attempts, maxAttempts, completedGames, generateNewGame]);

  // Ovládání čísel pro number-input mód
  const incrementNumber = useCallback(() => {
    setNumberInput(prev => Math.min(prev + 1, 20));
    playSound('click');
  }, [playSound]);

  const decrementNumber = useCallback(() => {
    setNumberInput(prev => Math.max(prev - 1, 0));
    playSound('click');
  }, [playSound]);

  // Mazání teček a resetování čísel
  const clearInput = useCallback(() => {
    if (currentGame.mode === 'count') {
      setClickFieldDots([]);
    } else if (currentGame.mode === 'complete' || currentGame.mode === 'complete-number') {
      setHiddenSideDots([]);
    } else if (currentGame.mode === 'number-input') {
      setNumberInput(0);
    }
    playSound('click');
  }, [currentGame.mode, playSound]);

  // Vytvoření teček pro pole CELKEM v complete módu - vycentrované
  const generateCelkemDots = useCallback((totalCount: number) => {
    const dots = [];
    const dotsPerRow = 12;
    const dotSpacing = 45;
    const dotRadius = 18;
    const fieldWidth = 595;
    const rows = Math.ceil(totalCount / dotsPerRow);
    
    for (let i = 0; i < totalCount; i++) {
      const row = Math.floor(i / dotsPerRow);
      const col = i % dotsPerRow;
      
      // Počet teček v aktuálním řádku
      const dotsInThisRow = row === rows - 1 ? totalCount - row * dotsPerRow : dotsPerRow;
      
      // Celková šířka řádku (vzdálenost od středu první tečky po střed poslední)
      const rowWidth = (dotsInThisRow - 1) * dotSpacing;
      
      // Startovní x pozice pro vycentrování řádku
      const startX = (fieldWidth - rowWidth) / 2;
      
      const x = startX + col * dotSpacing;
      const y = rows === 1 ? 80 : 50 + row * 60;
      
      dots.push(
        <circle
          key={`celkem-dot-${i}`}
          cx={x}
          cy={y}
          r="18"
          fill="url(#plasticDotGradient)"
          stroke="#666"
          strokeWidth="0.5"
          filter="url(#dotShadow)"
        />
      );
    }
    return dots;
  }, []);

  // Určení správné odpovědi pro kontrolu
  const getCorrectAnswer = useCallback(() => {
    if (currentGame.mode === 'count' || currentGame.mode === 'number-input') {
      return currentGame.leftDots + currentGame.rightDots;
    } else if (currentGame.mode === 'complete' || currentGame.mode === 'complete-number') {
      const visibleSide = currentGame.hiddenSide === 'left' ? currentGame.rightDots : currentGame.leftDots;
      return (currentGame.total || 0) - visibleSide;
    }
    return 0;
  }, [currentGame]);

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center p-2 md:p-3 lg:p-4 relative" style={{ backgroundColor }}>
      
      {/* SVG definice pro gradienty a efekty */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <radialGradient id="plasticDotGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="30%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0.5" dy="1" stdDeviation="0.5" floodColor="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
      </svg>

      {/* Hlavní herní obsah */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-2 md:gap-4 lg:gap-5">
        
        {/* Instrukce podle módu - optimalizováno pro malé obrazovky */}
        <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#4e5871] text-center mb-1 md:mb-2">
          {currentGame.mode === 'count' && 'SPOČÍTEJ A NAKLIKEJ'}
          {currentGame.mode === 'complete' && 'DOPLŇ CHYBĚJÍCÍ TEČKY'}
          {currentGame.mode === 'complete-number' && 'DOPLŇ CHYBĚJÍCÍ TEČKY'}
          {currentGame.mode === 'number-input' && 'SPOČÍTEJ VÝSLEDEK'}
        </div>
        
        {/* Progress indikátor kola - zvětšený o 10% */}
        <div className="md:fixed md:top-4 md:right-4 z-40 bg-white rounded-lg shadow-lg px-4 py-2 md:px-4">
          <div className="text-sm md:text-sm font-bold text-[#4e5871]">
            Kolo: {completedGames}/10
          </div>
          <div className="w-18 md:w-24 h-2 md:h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-full bg-[#4e5871] rounded-full transition-all duration-300"
              style={{ width: `${(completedGames / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Domino a pravá část */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-3 md:gap-5 lg:gap-8">
          
          {/* Domino - responzivní velikosti */}
          <div className="relative">
            <div className="w-[320px] h-[160px] md:w-[450px] md:h-[225px] lg:w-[500px] lg:h-[250px] max-w-[90vw] relative">
              <img 
                src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/domino%20(1).svg"
                alt="Domino"
                className="w-full h-full object-contain"
              />
              
              {/* Overlay SVG pro přesné pozicování podle skutečného domina */}
              <svg 
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 595 298"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Levá strana domina */}
                <g>
                  {(currentGame.mode === 'complete' || currentGame.mode === 'complete-number') && 
                   currentGame.hiddenSide === 'left' ? (
                    <>
                      {/* Klikací pole na levé straně - posunuto o 3% dál od středu */}
                      <rect 
                        x="31" 
                        y="39" 
                        width="239" 
                        height="221" 
                        rx="21" 
                        ry="21" 
                        fill="white" 
                        fillOpacity="0.9"
                        stroke="#4e5871" 
                        strokeWidth="4"
                        className="cursor-pointer hover:fill-gray-50"
                        onClick={handleHiddenSideClick}
                      />
                      
                      {/* Naklikané tečky */}
                      {hiddenSideDots.map((dot) => (
                        <circle
                          key={dot.id}
                          cx={31 + (dot.x / 100) * 239}
                          cy={39 + (dot.y / 100) * 221}
                          r="23"
                          fill="url(#plasticDotGradient)"
                          stroke="#666"
                          strokeWidth="0.5"
                          filter="url(#dotShadow)"
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Tečky levé strany - pole posunuto o 3% dál od středu */}
                      {generateDicePattern(currentGame.leftDots).map((dot, index) => {
                        const cx = parseFloat(dot.props.cx.replace('%', ''));
                        const cy = parseFloat(dot.props.cy.replace('%', ''));
                        return (
                          <circle
                            key={`left-${index}`}
                            cx={31 + (cx / 100) * 239}
                            cy={17 + (cy / 100) * 265}
                            r="23"
                            fill="url(#plasticDotGradient)"
                            stroke="#666"
                            strokeWidth="0.5"
                            filter="url(#dotShadow)"
                          />
                        );
                      })}
                    </>
                  )}
                </g>

                {/* Pravá strana domina */}
                <g>
                  {(currentGame.mode === 'complete' || currentGame.mode === 'complete-number') && 
                   currentGame.hiddenSide === 'right' ? (
                    <>
                      {/* Klikací pole na pravé straně - posunuto o 3% dál od středu */}
                      <rect 
                        x="326" 
                        y="39" 
                        width="239" 
                        height="221" 
                        rx="21" 
                        ry="21" 
                        fill="white" 
                        fillOpacity="0.9"
                        stroke="#4e5871" 
                        strokeWidth="4"
                        className="cursor-pointer hover:fill-gray-50"
                        onClick={handleHiddenSideClick}
                      />
                      
                      {/* Naklikané tečky */}
                      {hiddenSideDots.map((dot) => (
                        <circle
                          key={dot.id}
                          cx={326 + (dot.x / 100) * 239}
                          cy={39 + (dot.y / 100) * 221}
                          r="23"
                          fill="url(#plasticDotGradient)"
                          stroke="#666"
                          strokeWidth="0.5"
                          filter="url(#dotShadow)"
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Tečky pravé strany - pole posunuto o 3% dál od středu */}
                      {generateDicePattern(currentGame.rightDots).map((dot, index) => {
                        const cx = parseFloat(dot.props.cx.replace('%', ''));
                        const cy = parseFloat(dot.props.cy.replace('%', ''));
                        return (
                          <circle
                            key={`right-${index}`}
                            cx={326 + (cx / 100) * 239}
                            cy={17 + (cy / 100) * 265}
                            r="23"
                            fill="url(#plasticDotGradient)"
                            stroke="#666"
                            strokeWidth="0.5"
                            filter="url(#dotShadow)"
                          />
                        );
                      })}
                    </>
                  )}
                </g>
              </svg>
            </div>
          </div>

          {/* Pravá část - Rovnice pro complete-number mód */}
          {currentGame.mode === 'complete-number' && (
            <div className="flex items-center gap-2 md:gap-4 lg:gap-5 text-[#4e5871] font-bold text-[50px] md:text-[80px] lg:text-[100px]">
              <span>=</span>
              <span>{currentGame.total}</span>
            </div>
          )}

          {/* Číselný vstup pro number-input mód */}
          {currentGame.mode === 'number-input' && (
            <div className="bg-white border-2 md:border-3 lg:border-4 border-[#4e5871] rounded-2xl md:rounded-3xl shadow-lg py-3 md:py-5 lg:py-6 px-3 md:px-6 lg:px-8 flex items-center gap-3 md:gap-5 lg:gap-6">
              <div className="text-[#4e5871] font-bold min-w-[80px] md:min-w-[140px] lg:min-w-[160px] text-center px-2 md:px-3 text-[60px] md:text-[100px] lg:text-[120px]">
                {numberInput}
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={incrementNumber}
                  className="text-2xl md:text-3xl lg:text-4xl py-2 md:py-4 lg:py-5 px-3 md:px-5 lg:px-6 bg-[#4e5871] text-white hover:bg-[#3a4259] border-none rounded-xl md:rounded-2xl min-h-[45px] md:min-h-[60px] lg:min-h-[70px] min-w-[45px] md:min-w-[60px] lg:min-w-[70px]"
                >
                  ↑
                </Button>
                <Button 
                  onClick={decrementNumber}
                  className="text-2xl md:text-3xl lg:text-4xl py-2 md:py-4 lg:py-5 px-3 md:px-5 lg:px-6 bg-[#4e5871] text-white hover:bg-[#3a4259] border-none rounded-xl md:rounded-2xl min-h-[45px] md:min-h-[60px] lg:min-h-[70px] min-w-[45px] md:min-w-[60px] lg:min-w-[70px]"
                >
                  ↓
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* CELKEM pole - pro count a complete módy */}
        {(currentGame.mode === 'count' || currentGame.mode === 'complete') && (
          <div className="flex flex-col items-center gap-1 md:gap-2 lg:gap-3 w-full">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#4e5871]">CELKEM</h3>
            <div className="relative">
              <svg 
                width="595" 
                height="160" 
                viewBox="0 0 595 160" 
                className={`w-[320px] md:w-[450px] lg:w-[500px] h-[86px] md:h-[121px] lg:h-[135px] max-w-[90vw] border-2 md:border-3 lg:border-4 border-[#4e5871] rounded-2xl md:rounded-3xl shadow-lg ${
                  currentGame.mode === 'count' 
                    ? 'bg-white cursor-pointer hover:bg-gray-50' 
                    : 'bg-transparent'
                }`}
                onClick={currentGame.mode === 'count' ? handleClickFieldClick : undefined}
              >
                {currentGame.mode === 'count' ? (
                  // Prázdné pole pro naklikávání teček
                  <>
                    {clickFieldDots.map((dot) => (
                      <circle
                        key={dot.id}
                        cx={(dot.x / 100) * 595}
                        cy={(dot.y / 100) * 160}
                        r="18"
                        fill="url(#plasticDotGradient)"
                        stroke="#666"
                        strokeWidth="0.5"
                        filter="url(#dotShadow)"
                      />
                    ))}
                  </>
                ) : (
                  // Předvyplněné tečky pro complete mód
                  generateCelkemDots(currentGame.total || 0)
                )}
              </svg>
            </div>
          </div>
        )}

        {/* Tlačítka */}
        <div className="flex flex-col gap-2 md:gap-3 items-center justify-center w-full max-w-md">
          <Button
            onClick={checkAnswer}
            disabled={roundInProgress}
            className="px-5 md:px-7 lg:px-8 py-2 md:py-3 lg:py-3.5 text-base md:text-lg lg:text-xl font-bold bg-green-500 text-white hover:bg-green-600 border-none rounded-full shadow-lg disabled:opacity-50"
          >
            ZKONTROLOVAT
          </Button>

          <Button
            onClick={clearInput}
            disabled={
              (currentGame.mode === 'count' && clickFieldDots.length === 0) ||
              ((currentGame.mode === 'complete' || currentGame.mode === 'complete-number') && hiddenSideDots.length === 0) ||
              (currentGame.mode === 'number-input' && numberInput === 0)
            }
            className="px-5 md:px-7 lg:px-8 py-2 md:py-3 lg:py-3.5 text-base md:text-lg lg:text-xl font-medium bg-red-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed border-none rounded-full shadow-lg"
          >
            {currentGame.mode === 'number-input' ? 'RESETOVAT' : 'SMAZAT TEČKY'}
          </Button>
          
          {/* Tlačítko Nová úloha - pod tlačítko resetovat na mobilu, vpravo dole na desktopu */}
          <Button
            onClick={() => {
              generateNewGame();
              setCompletedGames(0); // Reset kola
            }}
            className="md:hidden px-5 py-2 text-base font-medium bg-[#4e5871] text-white hover:bg-[#3a4259] border-none rounded-full shadow-lg flex items-center justify-center gap-2"
          >
            Nová úloha
            <span className="text-lg">🎲</span>
          </Button>
        </div>
      </div>

      {/* Tlačítko Nová úloha v pravém dolním rohu - pouze desktop */}
      <div className="hidden md:block fixed bottom-4 right-4 lg:bottom-5 lg:right-5">
        <Button
          onClick={() => {
            generateNewGame();
            setCompletedGames(0); // Reset kola
          }}
          className="px-5 lg:px-6 py-2.5 lg:py-3 text-base lg:text-lg font-medium bg-[#4e5871] text-white hover:bg-[#3a4259] border-none rounded-full shadow-lg flex items-center gap-2"
        >
          Nová úloha
          <span className="text-lg lg:text-xl">🎲</span>
        </Button>
      </div>

      {/* Univerzální hlášky správně/špatně */}
      {showCorrectAnswer && (
        <GameResultScreen
          isSuccess={
            (currentGame.mode === 'count' && clickFieldDots.length === getCorrectAnswer()) ||
            ((currentGame.mode === 'complete' || currentGame.mode === 'complete-number') && hiddenSideDots.length === getCorrectAnswer()) ||
            (currentGame.mode === 'number-input' && numberInput === getCorrectAnswer())
          }
          onContinue={() => setShowCorrectAnswer(false)}
          autoHideDuration={undefined}
          successText="SPRÁVNĚ!"
          failureText="ZKUS TO ZNOVU!"
          showContinueButton={false}
          displayType="correctAnswer"
        />
      )}

      {/* Výsledková obrazovka na konci kola (10 domin) */}
      {showGameComplete && (
        <GameResultScreen
          isSuccess={true} // Vždy úspěšné dokončení kola
          onContinue={() => {
            setShowGameComplete(false);
            generateNewGame();
          }}
          autoHideDuration={undefined}
          successText={['Skvělé kolo! 🎯', 'Dokončil jsi 10 úloh! 🧮', 'Perfektní výkon! ⭐', 'Jsi šampion! 🏆'][Math.floor(Math.random() * 4)]}
          showContinueButton={true}
          displayType="gameComplete"
        />
      )}
    </div>
  );
}