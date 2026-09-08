import { useState, useCallback } from 'react';
import { GamePath } from './GamePath';
import { StraightGamePath } from './StraightGamePath';
import { Dice } from './Dice';
import { DoubleDice } from './DoubleDice';
import { LEVELS, Level } from './LevelSelector';
import { GameIntroVideo } from './GameIntroVideo';

import { Button } from './ui/button';
import { Trophy, RotateCcw, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface BoardGameProps {
  settings?: {
    backgroundColor?: string;
    startingLevel?: number;
    allowLevelChange?: boolean;
    allowMixedDirections?: boolean;
    autoIntroVideo?: boolean;
  };
  onBackToAdmin?: () => void;
}

export function BoardGame({ settings = {}, onBackToAdmin }: BoardGameProps) {
  const {
    backgroundColor = '#FCF4E9',
    startingLevel = 1,
    allowLevelChange = true,
    allowMixedDirections = false,
    autoIntroVideo = true,
  } = settings;
  


  // Stav levelu - použijeme nastavení
  const selectedLevel = LEVELS[startingLevel - 1] || LEVELS[0];
  const [showIntroVideo, setShowIntroVideo] = useState(autoIntroVideo);
  const [gameStarted, setGameStarted] = useState(!autoIntroVideo);
  
  const [playerPositions, setPlayerPositions] = useState([1, 1]); // Pozice dvou hráčů (začínají na 1)
  const [currentPlayer, setCurrentPlayer] = useState(0); // Aktuální hráč (0 nebo 1)
  const [diceValue, setDiceValue] = useState(0);
  const [diceValues, setDiceValues] = useState<[number, number]>([0, 0]); // Pro dvě kostky
  const [isRolling, setIsRolling] = useState(false);
  const [stepsToMove, setStepsToMove] = useState(0); // Kolik kroků ještě musí hráč udělat
  const [packagePosition, setPackagePosition] = useState<number | null>(null); // Pozice balíčku
  const [usedPackagePositions, setUsedPackagePositions] = useState<number[]>([]); // Historie použitých pozic
  const [packagesCollected, setPackagesCollected] = useState([0, 0]); // Počet sebraných balíčků pro každého hráče
  const [needsExactMatch, setNeedsExactMatch] = useState(false); // Zda musí trefit přesně
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [lastMoveDirection, setLastMoveDirection] = useState<'forward' | 'backward' | null>(null);
  const [packageDropped, setPackageDropped] = useState(false); // Zda byl balíček vhozen v aktuálním kole
  const [isPackageAnimating, setIsPackageAnimating] = useState(false); // Animace vhození balíčku
  const [playerCelebrating, setPlayerCelebrating] = useState<number | null>(null); // Který hráč slaví
  const [moveCommands, setMoveCommands] = useState<('forward' | 'backward')[]>([]); // Seznam příkazů k pohybu
  const [isExecutingCommands, setIsExecutingCommands] = useState(false); // Probíhá vykonávání příkazů
  const [wrongMoves, setWrongMoves] = useState([0, 0]); // Počet chybných tahů pro každého hráče
  const [showWrongStepsMessage, setShowWrongStepsMessage] = useState(false); // Zobrazení chybové správy
  const [selectedDirection, setSelectedDirection] = useState<'forward' | 'backward' | null>(null); // Vybraný směr pohybu
  
  const playerColors = ['#EEB105', '#177E5D']; // Žlutá pro kluka, zelená pro holky
  const playerNames = ['Kluk', 'Holka'];
  
  // Generování nového balíčku na náhodné pozici
  const generateNewPackage = useCallback(() => {
    const availablePositions = [];
    const startPosition = selectedLevel.pathType === 'straight' ? 2 : 2; // Pro rovnou cestu vynecháme START
    const endPosition = selectedLevel.pathType === 'straight' ? selectedLevel.totalSteps - 1 : selectedLevel.totalSteps; // Pro rovnou cestu vynecháme CÍL
    
    for (let i = startPosition; i <= endPosition; i++) {
      if (!playerPositions.includes(i) && !usedPackagePositions.includes(i)) {
        availablePositions.push(i);
      }
    }
    
    // Pokud už jsme použili všechny pozice, resetujeme historii (kromě aktuální pozice)
    if (availablePositions.length === 0) {
      setUsedPackagePositions(packagePosition ? [packagePosition] : []);
      // Znovu sestavíme dostupné pozice
      for (let i = startPosition; i <= endPosition; i++) {
        if (!playerPositions.includes(i) && i !== packagePosition) {
          availablePositions.push(i);
        }
      }
    }
    
    if (availablePositions.length > 0) {
      const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      setPackagePosition(randomPosition);
      
      // Přidáme novou pozici do historie použitých pozic
      setUsedPackagePositions(prev => [...prev, randomPosition]);
      
      // Určíme, jestli bude potřeba přesný hod (někdy ano, někdy ne)
      setNeedsExactMatch(Math.random() > 0.4);
    }
  }, [playerPositions, usedPackagePositions, packagePosition, selectedLevel]);

  // Vhození balíčku s animací
  const dropPackage = useCallback(() => {
    if (isPackageAnimating || packageDropped) return;
    
    setIsPackageAnimating(true);
    
    // Animace trvá 2 sekundy
    setTimeout(() => {
      generateNewPackage();
      setPackageDropped(true);
      setIsPackageAnimating(false);
    }, 2000);
  }, [isPackageAnimating, packageDropped, generateNewPackage]);

  const rollDice = useCallback(() => {
    if (isRolling || stepsToMove > 0 || gameWon || !packageDropped) return;
    
    setIsRolling(true);
    
    if (selectedLevel.diceCount === 1) {
      setDiceValue(0);
      
      // Simulace házení jednou kostkou
      let rollCount = 0;
      const rollInterval = setInterval(() => {
        setDiceValue(Math.floor(Math.random() * 6) + 1);
        rollCount++;
        
        if (rollCount > 10) {
          clearInterval(rollInterval);
          const finalValue = Math.floor(Math.random() * 6) + 1;
          setDiceValue(finalValue);
          setStepsToMove(finalValue);
          setIsRolling(false);
        }
      }, 100);
    } else {
      setDiceValues([0, 0]);
      
      // Simulace házení dvěma kostkami
      let rollCount = 0;
      const rollInterval = setInterval(() => {
        setDiceValues([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
        rollCount++;
        
        if (rollCount > 10) {
          clearInterval(rollInterval);
          const finalValues: [number, number] = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
          setDiceValues(finalValues);
          setStepsToMove(finalValues[0] + finalValues[1]);
          setIsRolling(false);
        }
      }, 100);
    }
  }, [isRolling, stepsToMove, packageDropped, gameWon, selectedLevel.diceCount]);
  
  const movePlayerForward = useCallback(() => {
    if (stepsToMove <= 0 || gameWon) return;
    
    setLastMoveDirection('forward');
    
    setPlayerPositions(prev => {
      const newPositions = [...prev];
      let newPosition = newPositions[currentPlayer] + 1;
      
      // Pro kruhovou cestu - cyklické přecházení
      if (selectedLevel.pathType === 'circle') {
        if (newPosition > selectedLevel.totalSteps) {
          newPosition = 1;
        }
      } else {
        // Pro rovnou cestu - zastavíme na posledním políčku
        if (newPosition > selectedLevel.totalSteps) {
          newPosition = selectedLevel.totalSteps;
        }
      }
      
      newPositions[currentPlayer] = newPosition;
      
      // Kontrola, jestli jsme skončili na balíčku (pouze pokud je to náš poslední krok)
      if (packagePosition && newPosition === packagePosition && stepsToMove === 1) {
        // Sebrali jsme balíček! Spustíme oslavu
        setPlayerCelebrating(currentPlayer);
        
        // Simulace zvukového efektu pomocí vibrace (pokud je dostupná)
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        setPackagesCollected(prev => {
          const newCollected = [...prev];
          newCollected[currentPlayer]++;
          
          // Kontrola výhry
          if (newCollected[currentPlayer] >= selectedLevel.packagesToWin) {
            setGameWon(true);
            setWinner(currentPlayer);
          }
          
          return newCollected;
        });
        
        setPackagePosition(null);
        setPackageDropped(false); // Reset pro dalš�� kolo
        setStepsToMove(0); // Ukončíme tah
        
        // Ukončíme oslavu po 1 sekundě
        setTimeout(() => {
          setPlayerCelebrating(null);
        }, 1000);
        
        return newPositions;
      }
      
      return newPositions;
    });
    
    setStepsToMove(prev => prev - 1);
  }, [stepsToMove, gameWon, currentPlayer, packagePosition]);

  const movePlayerBackward = useCallback(() => {
    if (stepsToMove <= 0 || gameWon) return;
    
    setLastMoveDirection('backward');
    
    setPlayerPositions(prev => {
      const newPositions = [...prev];
      let newPosition = newPositions[currentPlayer] - 1;
      
      // Pro kruhovou cestu - cyklické přecházení
      if (selectedLevel.pathType === 'circle') {
        if (newPosition < 1) {
          newPosition = selectedLevel.totalSteps;
        }
      } else {
        // Pro rovnou cestu - zastavíme na prvním políčku
        if (newPosition < 1) {
          newPosition = 1;
        }
      }
      
      newPositions[currentPlayer] = newPosition;
      
      // Kontrola, jestli jsme skončili na balíčku (pouze pokud je to náš poslední krok)
      if (packagePosition && newPosition === packagePosition && stepsToMove === 1) {
        // Sebrali jsme balíček! Spustíme oslavu
        setPlayerCelebrating(currentPlayer);
        
        setPackagesCollected(prev => {
          const newCollected = [...prev];
          newCollected[currentPlayer]++;
          
          // Kontrola výhry
          if (newCollected[currentPlayer] >= selectedLevel.packagesToWin) {
            setGameWon(true);
            setWinner(currentPlayer);
          }
          
          return newCollected;
        });
        
        setPackagePosition(null);
        setPackageDropped(false); // Reset pro další kolo
        setStepsToMove(0); // Ukončíme tah
        
        // Ukončíme oslavu po 1 sekundě
        setTimeout(() => {
          setPlayerCelebrating(null);
        }, 1000);
        
        return newPositions;
      }
      
      return newPositions;
    });
    
    setStepsToMove(prev => prev - 1);
  }, [stepsToMove, gameWon, currentPlayer, packagePosition]);
  
  const resetGame = useCallback(() => {
    setPlayerPositions([1, 1]);
    setCurrentPlayer(0);
    setDiceValue(0);
    setDiceValues([0, 0]);
    setStepsToMove(0);
    setPackagesCollected([0, 0]);
    setPackagePosition(null);
    setUsedPackagePositions([]);
    setNeedsExactMatch(false);
    setGameWon(false);
    setWinner(null);
    setLastMoveDirection(null);
    setPackageDropped(false);
    setIsPackageAnimating(false);
    setPlayerCelebrating(null);
    setMoveCommands([]);
    setIsExecutingCommands(false);
    setWrongMoves([0, 0]);
    setShowWrongStepsMessage(false);
    setSelectedDirection(null); // Resetujeme vybraný směr
  }, []);

  const handleVideoEnd = useCallback(() => {
    setShowIntroVideo(false);
    setGameStarted(true);
  }, []);

  // Přidání příkazu - podle nastavení může být omezen na jeden směr
  const handleAddCommand = useCallback((command: 'forward' | 'backward') => {
    if (stepsToMove > 0 && !isExecutingCommands) {
      // Pokud je povolena kombinace směrů, přidáme příkaz bez omezení
      if (allowMixedDirections) {
        setMoveCommands(prev => [...prev, command]);
      }
      // Pokud není povolena kombinace směrů, můžeme jít pouze jedním směrem
      else {
        // Pokud je to první příkaz, nastavíme směr
        if (moveCommands.length === 0) {
          setSelectedDirection(command);
          setMoveCommands([command]);
        }
        // Pokud již existují příkazy, přidáme pouze pokud je stejný směr
        else if (selectedDirection === command) {
          setMoveCommands(prev => [...prev, command]);
        }
        // Pokud je jiný směr, ignorujeme (tlačítko bude disabled)
      }
    }
  }, [stepsToMove, isExecutingCommands, moveCommands.length, selectedDirection, allowMixedDirections]);

  // Vymazání příkazů
  const handleClearCommands = useCallback(() => {
    if (!isExecutingCommands) {
      setMoveCommands([]);
      setSelectedDirection(null); // Resetujeme vybraný směr
    }
  }, [isExecutingCommands]);

  // Spuštění pohybu podle příkazů
  const handleExecuteCommands = useCallback(() => {
    if (moveCommands.length === 0 || isExecutingCommands || gameWon) return;
    
    // Kontrola správnosti počtu kroků
    const expectedSteps = selectedLevel.diceCount === 1 ? diceValue : diceValues[0] + diceValues[1];
    const isCorrectStepCount = moveCommands.length === expectedSteps;
    
    setIsExecutingCommands(true);
    
    // Pokud je špatný počet kroků, ukončíme tah s chybou
    if (!isCorrectStepCount) {
      // Zobrazíme chybovou správu
      setShowWrongStepsMessage(true);
      
      // Zobrazíme chybovou správu na 2 sekundy
      setTimeout(() => {
        setShowWrongStepsMessage(false);
        // Přidáme chybný bod
        setWrongMoves(prev => {
          const newWrongMoves = [...prev];
          newWrongMoves[currentPlayer]++;
          
          // Pokud hráč má 3 chybné body, odebereme mu jeden balíček
          if (newWrongMoves[currentPlayer] >= 3 && packagesCollected[currentPlayer] > 0) {
            setPackagesCollected(prevPackages => {
              const newPackages = [...prevPackages];
              newPackages[currentPlayer] = Math.max(0, newPackages[currentPlayer] - 1);
              return newPackages;
            });
            newWrongMoves[currentPlayer] = 0; // Resetujeme chybné body
          }
          
          return newWrongMoves;
        });
        
        // Ukončíme tah a přepneme hráče
        setIsExecutingCommands(false);
        setMoveCommands([]);
        setStepsToMove(0);
        setSelectedDirection(null); // Resetujeme vybraný směr
        
        // Přepneme hráče pokud hra neskončila
        if (!gameWon) {
          setCurrentPlayer(prev => (prev + 1) % 2);
          setDiceValue(0);
          setDiceValues([0, 0]);
          if (!packagePosition) {
            setPackageDropped(false);
          }
        }
      }, 2000);
      
      return; // Ukončíme funkci bez vykonání pohybu
    }
    
    // Vykonávání příkazů postupně s pauzou mezi nimi (pouze pro správný počet kroků)
    let commandIndex = 0;
    let shouldContinue = true;
    
    const executeNextCommand = () => {
      if (!shouldContinue || commandIndex >= moveCommands.length) {
        // Po dokončení všech kroků nebo předčasném ukončení
        if (shouldContinue) {
          setTimeout(() => {
            setIsExecutingCommands(false);
            setMoveCommands([]);
            setSelectedDirection(null); // Resetujeme vybraný směr
            
            // Přepneme hráče pokud hra neskončila
            if (!gameWon) {
              setCurrentPlayer(prev => (prev + 1) % 2);
              setDiceValue(0);
              setDiceValues([0, 0]);
              if (!packagePosition) {
                setPackageDropped(false);
              }
            }
          }, 500);
        }
        return;
      }
      
      const command = moveCommands[commandIndex];
      
      // Přímá aktualizace stavu místo volání funkcí
      setLastMoveDirection(command);
      
      setPlayerPositions(prev => {
        const newPositions = [...prev];
        let newPosition = newPositions[currentPlayer];
        
        if (command === 'forward') {
          newPosition = newPosition + 1;
        } else {
          newPosition = newPosition - 1;
        }
        
        // Pro kruhovou cestu - cyklické přecházení
        if (selectedLevel.pathType === 'circle') {
          if (newPosition > selectedLevel.totalSteps) {
            newPosition = 1;
          } else if (newPosition < 1) {
            newPosition = selectedLevel.totalSteps;
          }
        } else {
          // Pro rovnou cestu - omezení na hranice
          if (newPosition > selectedLevel.totalSteps) {
            newPosition = selectedLevel.totalSteps;
          } else if (newPosition < 1) {
            newPosition = 1;
          }
        }
        
        newPositions[currentPlayer] = newPosition;
        return newPositions;
      });
      
      setStepsToMove(prev => prev - 1);
      
      commandIndex++;
      
      // Pokud jsme dokončili všechny kroky, zkontrolujeme balíček
      if (commandIndex >= moveCommands.length) {
        // Kontrola, jestli jsme skončili na balíčku
        setPlayerPositions(currentPositions => {
          const finalPosition = currentPositions[currentPlayer];
          
          if (packagePosition && finalPosition === packagePosition) {
            // Sebrali jsme balí��ek!
            setPlayerCelebrating(currentPlayer);
            
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            
            setPackagesCollected(prevCollected => {
              const newCollected = [...prevCollected];
              newCollected[currentPlayer]++;
              
              // Kontrola výhry
              if (newCollected[currentPlayer] >= selectedLevel.packagesToWin) {
                setGameWon(true);
                setWinner(currentPlayer);
              }
              
              return newCollected;
            });
            
            setPackagePosition(null);
            setPackageDropped(false);
            
            // Ukončíme oslavu po 1 sekundě
            setTimeout(() => {
              setPlayerCelebrating(null);
            }, 1000);
            
            // Ukončíme vykonávání př��kazů předčasně
            shouldContinue = false;
            setIsExecutingCommands(false);
            setMoveCommands([]);
            setStepsToMove(0);
            setSelectedDirection(null); // Resetujeme vybraný směr
            
            // Přepneme hráče
            setTimeout(() => {
              setCurrentPlayer(prev => (prev + 1) % 2);
              setDiceValue(0);
              setDiceValues([0, 0]);
            }, 1000);
          }
          
          return currentPositions;
        });
      }
      
      if (shouldContinue) {
        setTimeout(executeNextCommand, 800);
      }
    };
    
    executeNextCommand();
  }, [moveCommands, isExecutingCommands, gameWon, currentPlayer, packagePosition, selectedLevel]);

  // Pokud se má zobrazit intro video
  if (showIntroVideo) {
    return <GameIntroVideo onVideoEnd={handleVideoEnd} />;
  }

  return (
    <div className="h-screen p-4 relative font-visby" style={{ backgroundColor }}>
      {/* Tlačítko zpět do administrace - pouze pokud je callback poskytnut */}
      {onBackToAdmin && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onBackToAdmin}
            className="bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md shadow-md border border-gray-300 flex items-center gap-2 transition-colors text-sm"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Administrace
          </button>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto h-full">
        {/* Hlavní herní plocha - dva sloupce, na mobilu pořadí obrácené */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 h-full">
          {/* Levý sloupec na desktopu, dolní na mobilu - Herní cesta */}
          <div className="h-full order-2 lg:order-1">
            {selectedLevel.pathType === 'straight' ? (
              <StraightGamePath
                totalSteps={selectedLevel.totalSteps}
                playerPositions={playerPositions}
                playerColors={playerColors}
                packagePosition={packagePosition}
                lastMoveDirection={lastMoveDirection}
                currentPlayer={currentPlayer}
                isPackageAnimating={isPackageAnimating}
                playerCelebrating={playerCelebrating}
              />
            ) : (
              <GamePath
                totalSteps={selectedLevel.totalSteps}
                playerPositions={playerPositions}
                playerColors={playerColors}
                packagePosition={packagePosition}
                lastMoveDirection={lastMoveDirection}
                currentPlayer={currentPlayer}
                isPackageAnimating={isPackageAnimating}
                playerCelebrating={playerCelebrating}
              />
            )}
          </div>

          {/* Pravý sloupec na desktopu, horní na mobilu - Všechny ovládací prvky a informace */}
          <div className="flex items-center h-full order-1 lg:order-2">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 space-y-6 w-full">
            {/* Hlavička s názvem */}
            <div className="text-center">
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  🎁 Sbírej balíčky! 🎲
                </h1>
              </div>

              
              {/* Skóre hráčů */}
              <div className="flex flex-col gap-3 text-lg">
                {playerNames.map((name, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow border-2 ${
                      currentPlayer === index && !gameWon
                        ? 'border-4'
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: `${playerColors[index]}20`,
                      borderColor: playerColors[index]
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-xl" style={{ color: playerColors[index] }}>
                        {name}
                      </p>
                      <div className="flex gap-1">
                        {Array.from({ length: selectedLevel.packagesToWin }, (_, i) => (
                          <div key={i} className="w-6 h-6 flex items-center justify-center">
                            {i < packagesCollected[index] ? (
                              <span className="text-2xl">🎁</span>
                            ) : (
                              <div 
                                className="w-4 h-4 rounded-full border-2"
                                style={{ 
                                  backgroundColor: '#374151',
                                  borderColor: '#6B7280'
                                }}
                              ></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Zobrazení chybných bodů */}
                      {wrongMoves[index] > 0 && (
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-sm text-red-600">Chyby: {wrongMoves[index]}/3</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 3 }, (_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full" style={{
                                backgroundColor: i < wrongMoves[index] ? '#DC2626' : '#E5E7EB'
                              }}></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Výherní zpráva */}
            {gameWon && winner !== null && (
              <div className="text-center">
                <div className="bg-yellow-400 text-yellow-900 p-6 rounded-xl border-4 border-yellow-500 inline-block shadow-lg">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold mb-2">
                    🎉 Hráč {playerNames[winner]} vyhrál! 🎉
                  </h2>
                  <p className="text-lg">Gratulujeme k výhře!</p>
                </div>
              </div>
            )}

            {/* Tlačítko na vhození balíčku nebo kostka */}
            {!gameWon && (
              <div className="text-center">
                {!packageDropped && stepsToMove === 0 ? (
                  <div className="space-y-4">
                    {isPackageAnimating && (
                      <div className="text-4xl animate-bounce">🎁</div>
                    )}
                    <Button
                      onClick={dropPackage}
                      disabled={isPackageAnimating}
                      className="text-white px-8 py-4 text-xl border-2 shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ 
                        backgroundColor: playerColors[currentPlayer],
                        borderColor: playerColors[currentPlayer],
                        color: 'white'
                      }}
                    >
                      {isPackageAnimating ? 'Balíček padá...' : '🎁 Vhodit balíček!'}
                    </Button>
                  </div>
                ) : packageDropped && ((selectedLevel.diceCount === 1 && diceValue > 0) || (selectedLevel.diceCount === 2 && diceValues[0] > 0) || stepsToMove === 0) ? (
                  selectedLevel.diceCount === 1 ? (
                    <Dice
                      value={diceValue}
                      isRolling={isRolling}
                      onRoll={rollDice}
                      disabled={stepsToMove > 0 || gameWon}
                      playerColor={playerColors[currentPlayer]}
                    />
                  ) : (
                    <DoubleDice
                      values={diceValues}
                      isRolling={isRolling}
                      onRoll={rollDice}
                      disabled={stepsToMove > 0 || gameWon}
                      playerColor={playerColors[currentPlayer]}
                    />
                  )
                ) : null}
              </div>
            )}

            {/* Nový systém ovládání se šipkami */}
            {stepsToMove > 0 && !gameWon && (
              <div className="space-y-4">
                {/* Šipky pro zadávání příkazů */}
                <div className="space-y-3">
                  <h3 className="text-lg text-center">Šipky:</h3>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => handleAddCommand('backward')}
                      disabled={isExecutingCommands || (!allowMixedDirections && selectedDirection !== null && selectedDirection !== 'backward')}
                      className="w-16 h-16 text-2xl border-2 rounded-lg text-white"
                      style={{ 
                        backgroundColor: playerColors[currentPlayer],
                        borderColor: playerColors[currentPlayer],
                        filter: 'brightness(0.9)',
                        opacity: (!allowMixedDirections && selectedDirection !== null && selectedDirection !== 'backward') ? 0.3 : 1
                      }}
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </Button>
                    
                    <Button
                      onClick={() => handleAddCommand('forward')}
                      disabled={isExecutingCommands || (!allowMixedDirections && selectedDirection !== null && selectedDirection !== 'forward')}
                      className="w-16 h-16 text-2xl border-2 rounded-lg text-white"
                      style={{ 
                        backgroundColor: playerColors[currentPlayer],
                        borderColor: playerColors[currentPlayer],
                        filter: 'brightness(0.9)',
                        opacity: (!allowMixedDirections && selectedDirection !== null && selectedDirection !== 'forward') ? 0.3 : 1
                      }}
                    >
                      <ChevronRight className="w-8 h-8" />
                    </Button>
                  </div>
                </div>

                {/* Zobrazení příkazů */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg">KROKY:</h3>
                  </div>
                  
                  <div 
                    className="min-h-16 border-2 rounded-lg p-3 flex flex-wrap gap-2 items-center bg-gray-50"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    {moveCommands.length === 0 ? (
                      <span className="text-sm text-gray-500">Žádné kroky...</span>
                    ) : (
                      moveCommands.map((command, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center justify-center w-8 h-8 rounded border bg-blue-100 text-blue-800 border-blue-800"
                          style={{ fontSize: '18px' }}
                        >
                          {command === 'forward' ? '→' : '←'}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Tlačítka */}
                <div className="space-y-3">
                  {/* Chybová správa pro špatný počet kroků */}
                  {showWrongStepsMessage && (
                    <div className="text-center p-4 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-red-800 font-bold text-lg">
                        Špatný počet kroků!
                      </p>
                      <p className="text-red-600 text-sm mt-1">
                        {selectedLevel.diceCount === 1 
                          ? `Musíš mít přesně ${diceValue} kroků!`
                          : `Musíš mít přesně ${diceValues[0] + diceValues[1]} kroků!`
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Velké tlačítko Jdi! - nyní vždy aktivní */}
                  <Button
                    onClick={handleExecuteCommands}
                    disabled={isExecutingCommands || moveCommands.length === 0}
                    className="w-full h-14 text-xl text-white border-0 rounded-lg hover:opacity-90"
                    style={{ 
                      backgroundColor: moveCommands.length > 0 ? playerColors[currentPlayer] : '#9CA3AF',
                      opacity: moveCommands.length > 0 ? 1 : 0.5
                    }}
                  >
                    <Play className="w-6 h-6 mr-3" />
                    {showWrongStepsMessage ? 'Špatný počet!' : isExecutingCommands ? 'Jdu...' : 'Jdi!'}
                  </Button>

                  {/* Tlačítko pro vymazání */}
                  <Button
                    onClick={handleClearCommands}
                    disabled={isExecutingCommands || moveCommands.length === 0}
                    variant="outline"
                    className="w-full h-12 border-2 rounded-lg"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#6B7280'
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Vymazat kroky
                  </Button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
      
      {/* Tlačítko Nová hra v pravém dolním rohu */}
      <Button
        onClick={resetGame}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 bg-red-100 hover:bg-red-200 border-red-300 shadow-lg z-10"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Nová hra
      </Button>
    </div>
  );
}