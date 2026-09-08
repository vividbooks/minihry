import React, { useState, useCallback, useEffect } from 'react';
import { FloorTile } from './FloorTile';
import { Button } from './ui/button';
import { BallRed } from './BallRed';
import { BallBlue } from './BallBlue';
import { Trophy, RotateCcw, ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import svgPathsArrow from '../imports/svg-dw5nnw1d9l';
import Rectangle2896 from '../imports/Rectangle2896';
import { toast } from 'sonner@2.0.3';

interface MrBallGameProps {
  settings?: {
    difficulty?: number;
    backgroundColor?: string;
    autoIntroVideo?: boolean;
  };
  onBackToAdmin?: () => void;
}

// Barvy pro různá patra - rozšířené na 5 pater
const FLOOR_COLORS: ('green' | 'purple' | 'orange')[] = ['green', 'purple', 'orange', 'green', 'purple'];

// Funkce pro získání konfigurace podle obtížnosti
const getDifficultyConfig = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return { floors: 3, tilesPerFloor: 5, diceCount: 1 };
    case 2:
      return { floors: 4, tilesPerFloor: 7, diceCount: 1 };
    case 3:
      return { floors: 5, tilesPerFloor: 10, diceCount: 2 };
    default:
      return { floors: 4, tilesPerFloor: 7, diceCount: 1 };
  }
};

// Funkce pro generování náhodných pozic výtahů
const generateElevatorPositions = (floors: number, tilesPerFloor: number): number[] => {
  const positions: number[] = [];
  
  // Pro každé patro kromě posledního generujeme náhodnou pozici výtahu
  for (let floor = 0; floor < floors - 1; floor++) {
    let position: number;
    let attempts = 0;
    
    // Generujeme pozici, dokud nenajdeme takovou, která není pod předchozím výtahem
    do {
      // Dynamická pozice podle počtu políček
      const isLeft = Math.random() < 0.5;
      const leftRange = Math.floor(tilesPerFloor / 3);
      const rightStart = Math.ceil(tilesPerFloor * 2 / 3);
      
      // Na prvním patře (floor 0) nikdy pozice 0 (úplně vlevo)
      if (floor === 0) {
        position = isLeft 
          ? 1 + Math.floor(Math.random() * Math.max(1, leftRange - 1))
          : rightStart + Math.floor(Math.random() * (tilesPerFloor - rightStart));
      } else {
        position = isLeft 
          ? Math.floor(Math.random() * leftRange)
          : rightStart + Math.floor(Math.random() * (tilesPerFloor - rightStart));
      }
      
      attempts++;
      
      // Bezpečnostní pojistka - po 20 pokusech vezmeme jakoukoliv pozici
      if (attempts > 20) break;
    } while (positions.includes(position)); // Pokračujeme, dokud jsme našli duplicitní pozici
    
    positions.push(position);
  }
  
  positions.push(-1); // Poslední patro nemá výtah
  return positions;
};

export function MrBallGame({ settings = {}, onBackToAdmin }: MrBallGameProps) {
  const { difficulty = 2, backgroundColor = '#FFE5B4', autoIntroVideo = true } = settings;

  // Získání konfigurace pro danou obtížnost
  const config = getDifficultyConfig(difficulty);
  const FLOORS = config.floors;
  const TILES_PER_FLOOR = config.tilesPerFloor;
  const DICE_COUNT = config.diceCount;

  // Responzivní velikosti podle obtížnosti
  const getResponsiveSizes = () => {
    // Detekce mobilu
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    switch (difficulty) {
      case 1: // 5 políček, 3 patra - NEJVĚTŠÍ
        return {
          tileWidth: isMobile ? '4.5rem' : '7rem',      // Mobile: 72px, Desktop: 112px
          tileHeight: isMobile ? '4rem' : '6rem',       // Mobile: 64px, Desktop: 96px
          gap: isMobile ? '6px' : '10px',
          floorGap: isMobile ? '5rem' : '11.25rem',     // Mobile: 80px, Desktop: 180px
          ballSize: isMobile ? 'w-14 h-14' : 'w-20 h-20 md:w-24 md:h-24',
          panelWidth: '340px',
          fontSize: isMobile ? '20px' : '32px',
          arrowHeight: isMobile ? '72px' : '140px',     // Zkráceno o 20%: 90*0.8=72, 175*0.8=140
          elevatorDrop: isMobile ? 144 : 276
        };
      case 2: // 7 pol����ček, 4 patra - STŘEDNÍ (původní velikost)
        return {
          tileWidth: isMobile ? '3.75rem' : '6rem',     // Mobile: 60px, Desktop: 96px
          tileHeight: isMobile ? '3.25rem' : '5.25rem', // Mobile: 52px, Desktop: 84px
          gap: isMobile ? '5px' : '8px',
          floorGap: isMobile ? '4rem' : '9.375rem',     // Mobile: 64px, Desktop: 150px
          ballSize: isMobile ? 'w-12 h-12' : 'w-16 h-16 md:w-20 md:h-20',
          panelWidth: '308px',
          fontSize: isMobile ? '18px' : '28px',
          arrowHeight: isMobile ? '64px' : '116.4px',   // Zkráceno o 20%: 80*0.8=64, 145.5*0.8=116.4
          elevatorDrop: isMobile ? 116 : 234
        };
      case 3: // 10 políček, 5 pater - NEJMENŠÍ
        return {
          tileWidth: isMobile ? '3rem' : '4.5rem',      // Mobile: 48px, Desktop: 72px
          tileHeight: isMobile ? '2.625rem' : '4rem',   // Mobile: 42px, Desktop: 64px
          gap: isMobile ? '4px' : '6px',
          floorGap: isMobile ? '3rem' : '7rem',         // Mobile: 48px, Desktop: 112px
          ballSize: isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-16 md:h-16',
          panelWidth: '280px',
          fontSize: isMobile ? '16px' : '22px',
          arrowHeight: isMobile ? '52px' : '88px',      // Zkráceno o 20%: 65*0.8=52, 110*0.8=88
          elevatorDrop: isMobile ? 90 : 176
        };
      default:
        return {
          tileWidth: isMobile ? '3.75rem' : '6rem',
          tileHeight: isMobile ? '3.25rem' : '5.25rem',
          gap: isMobile ? '5px' : '8px',
          floorGap: isMobile ? '4rem' : '9.375rem',
          ballSize: isMobile ? 'w-12 h-12' : 'w-16 h-16 md:w-20 md:h-20',
          panelWidth: '308px',
          fontSize: isMobile ? '18px' : '28px',
          arrowHeight: isMobile ? '64px' : '116.4px',   // Zkráceno o 20%: 80*0.8=64, 145.5*0.8=116.4
          elevatorDrop: isMobile ? 116 : 234
        };
    }
  };

  const sizes = getResponsiveSizes();

  // Generování pozic výtahů pro tuto hru (náhodné pro každou novou hru)
  const [elevatorPositions] = useState<number[]>(() => generateElevatorPositions(FLOORS, TILES_PER_FLOOR));
  
  // Pomocná funkce pro získání pozice výtahu na daném patře
  const getElevatorPosition = (floorIndex: number): number => {
    return elevatorPositions[floorIndex] ?? -1;
  };

  // Hráči
  const [currentPlayer, setCurrentPlayer] = useState(0); // 0 = červený, 1 = modrý
  const playerColors = ['#FF4444', '#4444FF'];
  const playerNames = ['Červený', 'Modrý'];

  // Pozice hráčů: [floor, tile] - floor 0 je nahoře, FLOORS-1 je dole
  const [playerPositions, setPlayerPositions] = useState<[number, number][]>([
    [0, 0], // Červený začíná vlevo nahoře
    [0, 0], // Modrý začíná taky vlevo nahoře (společný start)
  ]);

  // Směr pohybu hráčů: 'left' nebo 'right'
  const [playerDirections, setPlayerDirections] = useState<('left' | 'right')[]>(['right', 'right']);

  // Výtahy které právě jedou (animují se)
  const [elevatorsAnimating, setElevatorsAnimating] = useState<Set<number>>(new Set());

  // Hra
  const [diceValue, setDiceValue] = useState(0); // Celková hodnota (pro 1 kostku přímo, pro 2 kostky součet)
  const [diceValues, setDiceValues] = useState<[number, number]>([0, 0]); // Hodnoty jednotlivých kostek (pro 2 kostky)
  const [isRolling, setIsRolling] = useState(false);
  const [moveCommands, setMoveCommands] = useState<('left' | 'right')[]>([]);
  const [isExecutingCommands, setIsExecutingCommands] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [heartCollected, setHeartCollected] = useState(false); // Animace sebrání srdíčka
  const [playerFalling, setPlayerFalling] = useState<number | null>(null); // Který hráč právě padá
  const [fallingPosition, setFallingPosition] = useState<{ floor: number; tile: number } | null>(null); // Pozice, odkud padá
  const [fallDirection, setFallDirection] = useState<'left' | 'right' | null>(null); // Směr pádu
  const [wonByFalling, setWonByFalling] = useState(false); // Zda někdo vyhrál kvůli pádu soupeře

  // Pozice srdíčka (floor, tile)
  const heartPosition: [number, number] = [FLOORS - 1, Math.floor(TILES_PER_FLOOR / 2)];

  // Systém stop - sledování návštěv políček pro každého hráče
  // Mapa: "floor-tile" -> { step: number, timestamp: number, playerIndex: number }
  const [footprints, setFootprints] = useState<Map<string, { step: number; timestamp: number; playerIndex: number }>>(new Map());
  const [stepCounters, setStepCounters] = useState<number[]>([0, 0]); // Počítadlo kroků pro každého hráče

  // Automatické čištění starých stop po 5 sekundách
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFootprints((prev) => {
        const newFootprints = new Map(prev);
        let hasChanges = false;
        
        for (const [key, value] of newFootprints.entries()) {
          // Pokud je stopa starší než 5 sekund, odstraníme ji
          if (now - value.timestamp > 5000) {
            newFootprints.delete(key);
            hasChanges = true;
          }
        }
        
        return hasChanges ? newFootprints : prev;
      });
    }, 500); // Kontrolujeme každých 500ms
    
    return () => clearInterval(interval);
  }, []);

  // Házení kostkou
  const rollDice = useCallback(() => {
    if (isRolling || moveCommands.length > 0 || gameWon) return;

    setIsRolling(true);
    setDiceValue(0);
    if (DICE_COUNT === 2) {
      setDiceValues([0, 0]);
    }

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      if (DICE_COUNT === 2) {
        const val1 = Math.floor(Math.random() * 6) + 1;
        const val2 = Math.floor(Math.random() * 6) + 1;
        setDiceValues([val1, val2]);
        setDiceValue(val1 + val2);
      } else {
        setDiceValue(Math.floor(Math.random() * 6) + 1);
      }
      rollCount++;

      if (rollCount > 10) {
        clearInterval(rollInterval);
        if (DICE_COUNT === 2) {
          const finalVal1 = Math.floor(Math.random() * 6) + 1;
          const finalVal2 = Math.floor(Math.random() * 6) + 1;
          setDiceValues([finalVal1, finalVal2]);
          setDiceValue(finalVal1 + finalVal2);
        } else {
          const finalValue = Math.floor(Math.random() * 6) + 1;
          setDiceValue(finalValue);
        }
        setIsRolling(false);
      }
    }, 100);
  }, [isRolling, moveCommands.length, gameWon, DICE_COUNT]);

  // Přidání příkazu - bez omezení počtu
  const handleAddCommand = useCallback(
    (command: 'left' | 'right') => {
      if (diceValue === 0 || isExecutingCommands) return;
      setMoveCommands((prev) => [...prev, command]);
    },
    [diceValue, isExecutingCommands]
  );

  // Vymazání příkazů
  const handleClearCommands = useCallback(() => {
    if (!isExecutingCommands) {
      setMoveCommands([]);
    }
  }, [isExecutingCommands]);

  // Kontrola, zda je pozice výtah
  const isElevatorPosition = (floor: number, tile: number): boolean => {
    const elevatorPos = getElevatorPosition(floor);
    return elevatorPos !== -1 && tile === elevatorPos;
  };

  // Provedení příkazů
  const handleExecuteCommands = useCallback(() => {
    if (moveCommands.length === 0 || isExecutingCommands || gameWon) return;

    // Kontrola počtu kroků - pokud je jiný než hodnota kostky, je to chyba
    if (moveCommands.length !== diceValue) {
      // Zobrazit chybovou hlášku
      toast.error(`Špatný počet kroků! Hodil jsi ${diceValue}, ale naklikal jsi ${moveCommands.length} kroků.`, {
        duration: 3000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          border: '2px solid #dc2626',
          fontSize: '16px',
          fontWeight: 'bold',
        }
      });
      
      // Resetovat počítadlo kroků pro aktuálního hráče
      setStepCounters((prev) => {
        const newCounters = [...prev];
        newCounters[currentPlayer] = 0;
        return newCounters;
      });
      
      // Přepnout na dalšího hráče
      setCurrentPlayer((prev) => (prev + 1) % 2);
      setMoveCommands([]);
      setDiceValue(0);
      setDiceValues([0, 0]);
      return;
    }

    setIsExecutingCommands(true);

    // Předáváme pozici jako parametr, aby se správně aktualizovala mezi příkazy
    const executeNextCommand = (commandIndex: number, currentPos: [number, number]) => {
      if (commandIndex >= moveCommands.length) {
        // Všechny příkazy provedeny
        setTimeout(() => {
          // Kontrola výhry
          if (currentPos[0] === heartPosition[0] && currentPos[1] === heartPosition[1]) {
            // Spustit animaci sebrání srdíčka
            setHeartCollected(true);
            
            // Po krátkém zpoždění zobrazit výhru
            setTimeout(() => {
              setGameWon(true);
              setWinner(currentPlayer);
            }, 800);
          } else {
            // Resetovat počítadlo kroků pro aktuálního hráče (každé kolo začíná od 1)
            setStepCounters((prev) => {
              const newCounters = [...prev];
              newCounters[currentPlayer] = 0;
              return newCounters;
            });
            
            // Přepneme hráče
            setCurrentPlayer((prev) => (prev + 1) % 2);
            setDiceValue(0);
            setDiceValues([0, 0]);
            setMoveCommands([]);
            setIsExecutingCommands(false);
          }
        }, 500);
        return;
      }

      const command = moveCommands[commandIndex];
      const [floor, tile] = currentPos;

      // Kontrola, zda hráč jde mimo hrací plochu
      let newTile = tile;
      let fallenOff = false;
      
      if (command === 'left') {
        if (tile === 0) {
          // Spadne doleva mimo hrací plochu
          fallenOff = true;
        } else {
          newTile = tile - 1;
        }
      } else {
        if (tile === TILES_PER_FLOOR - 1) {
          // Spadne doprava mimo hrací plochu
          fallenOff = true;
        } else {
          newTile = tile + 1;
        }
      }

      // Pokud hráč spadl mimo hrací plochu
      if (fallenOff) {
        // Aktualizovat směr pohybu
        setPlayerDirections((prev) => {
          const newDirections = [...prev];
          newDirections[currentPlayer] = command;
          return newDirections;
        });
        
        // ANIMACE: Kulička udělá krok mimo políčko a zmizí
        // Použijeme pozici jako "mimo políčko" dočasně
        const offScreenTile = command === 'left' ? -1 : TILES_PER_FLOOR;
        const tempPos: [number, number] = [floor, offScreenTile];
        
        // Nastavíme dočasnou pozici mimo herní plochu (vizuálně to způsobí krok mimo)
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          newPositions[currentPlayer] = tempPos;
          return newPositions;
        });
        
        // Spustit overlay s textem "SPADL!"
        setPlayerFalling(currentPlayer);
        setFallDirection(command);
        
        // Po krátké pauze vyhodnotit vítězství
        setTimeout(() => {
          const otherPlayer = (currentPlayer + 1) % 2;
          setGameWon(true);
          setWinner(otherPlayer);
          setWonByFalling(true);
          setIsExecutingCommands(false);
          setPlayerFalling(null);
          setFallDirection(null);
        }, 1000);
        
        return;
      }

      // Aktualizovat směr pohybu
      setPlayerDirections((prev) => {
        const newDirections = [...prev];
        newDirections[currentPlayer] = command;
        return newDirections;
      });

      // LOGIKA VÝTAHU: Výtah sjede POUZE když kulička KONČÍ tah na výtahu
      // Po sjezdu se výtah vrátí nahoru a je připraven k dalšímu použití
      
      const isLastCommand = commandIndex === moveCommands.length - 1;
      const isOnElevator = isElevatorPosition(floor, newTile);
      
      // Normální pohyb
      const newPos: [number, number] = [floor, newTile];
      
      setPlayerPositions((prev) => {
        const newPositions = [...prev];
        newPositions[currentPlayer] = newPos;
        return newPositions;
      });
      
      // Zaznamenat stopu na tomto políčku
      const footprintKey = `${floor}-${newTile}`;
      setStepCounters((prev) => {
        const newCounters = [...prev];
        newCounters[currentPlayer] += 1;
        
        // Zaznamenat návštěvu políčka samostatně
        const currentStep = newCounters[currentPlayer];
        setTimeout(() => {
          setFootprints((prevFootprints) => {
            const newFootprints = new Map(prevFootprints);
            newFootprints.set(footprintKey, {
              step: currentStep,
              timestamp: Date.now(),
              playerIndex: currentPlayer,
            });
            return newFootprints;
          });
        }, 0);
        
        return newCounters;
      });
      
      // PŘÍPAD 1: Kulička končí tah na výtahu → sjede výtah a pak se vrátí nahoru
      if (isLastCommand && isOnElevator && floor < FLOORS - 1) {
        const elevatorId = floor * TILES_PER_FLOOR + newTile;
        
        // KROK 1: Kulička stojí na výtahu 0.5 sekundy
        setTimeout(() => {
          // KROK 2: Spustíme animaci sjezdu výtahu (kulička zůstane na políčku, které sjíždí)
          setElevatorsAnimating((prev) => {
            const newSet = new Set(prev);
            newSet.add(elevatorId);
            return newSet;
          });
          
          // KROK 3: Po 1200ms (délka animace sjezdu) přesuneme kuličku a ukončíme animaci
          setTimeout(() => {
            const afterElevatorPos: [number, number] = [floor + 1, newTile];
            
            // Nejdřív přesuneme kuličku na nové patro (aby se objevila dole)
            setPlayerPositions((prev) => {
              const newPositions = [...prev];
              newPositions[currentPlayer] = afterElevatorPos;
              return newPositions;
            });
            
            // Pak ukončíme animaci výtahu a výtah se VRÁTÍ nahoru (neoznačujeme jako sjetý)
            setTimeout(() => {
              setElevatorsAnimating((prev) => {
                const newSet = new Set(prev);
                newSet.delete(elevatorId);
                return newSet;
              });
              
              // Výtah není krok, takže nezaznamenáváme stopu
              
              // Po sjezdu pokračujeme v příkazech S NOVOU POZICÍ
              setTimeout(() => executeNextCommand(commandIndex + 1, afterElevatorPos), 100);
            }, 100);
          }, 1200);
        }, 500); // 0.5 sekundy čekání na výtahu před sjezdem
      }
      // PŘÍPAD 2: Normální pohyb (pokud není výtah na konci tahu, kulička se pohybuje normálně)
      else {
        setTimeout(() => executeNextCommand(commandIndex + 1, newPos), 600);
      }
    };

    // Začínáme s aktuální pozicí hráče
    executeNextCommand(0, [...playerPositions[currentPlayer]]);
  }, [moveCommands, isExecutingCommands, gameWon, currentPlayer, playerPositions, heartPosition, diceValue, TILES_PER_FLOOR, FLOORS, playerColors, playerNames]);

  // Reset hry
  const resetGame = useCallback(() => {
    setPlayerPositions([
      [0, 0],
      [0, 0], // Obě kuličky začínají vlevo nahoře
    ]);
    setPlayerDirections(['right', 'right']);
    setCurrentPlayer(0);
    setDiceValue(0);
    setDiceValues([0, 0]);
    setMoveCommands([]);
    setIsExecutingCommands(false);
    setGameWon(false);
    setWinner(null);
    setHeartCollected(false);
    setPlayerFalling(null);
    setFallDirection(null);
    setFallingPosition(null);
    setWonByFalling(false);
    setElevatorsAnimating(new Set());
    setFootprints(new Map());
    setStepCounters([0, 0]);
  }, []);

  return (
    <div className="min-h-screen p-2 md:p-4 relative font-visby flex items-start md:items-center" style={{ backgroundColor }}>
      {/* Tlačítko zpět do administrace */}
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

      <div className="max-w-[1800px] mx-auto px-2 w-full pt-4 md:pt-0">
        {/* Responzivní layout: na mobilu flex-col (hra nahoře, panel dole), na desktopu grid (vedle sebe) */}
        <div className="flex flex-col lg:grid gap-4 items-start lg:items-center" style={{ gridTemplateColumns: `1fr ${sizes.panelWidth}` }}>
          {/* Herní plán */}
          <div className="w-full lg:order-1 relative mt-[100px] lg:mt-0">
            {/* Vykreslení pater - dynamické mezery podle obtížnosti */}
            <div id="game-board" style={{ display: 'flex', flexDirection: 'column', gap: sizes.floorGap }}>
              {Array.from({ length: FLOORS }, (_, floorIndex) => {
                return (
                  <div key={floorIndex}>
                    {/* Políčka na patře */}
                    <div className="flex justify-center" style={{ gap: sizes.gap }}>
                      {Array.from({ length: TILES_PER_FLOOR }, (_, tileIndex) => {
                        // Kontrola, jestli na tomto patře je výtah
                        const isElevatorHere = isElevatorPosition(floorIndex, tileIndex);
                        
                        // Zkontrolujeme, jestli tento výtah právě animuje
                        const elevatorId = floorIndex * TILES_PER_FLOOR + tileIndex;
                        const isElevatorAnimating = elevatorsAnimating.has(elevatorId);
                        
                        // Výtahy se vracejí nahoru, takže nikdy není díra - vždy zobrazujeme normální políčko
                        
                        // Najdeme všechny hráče na tomto pol��čku
                        const playersOnTile = playerPositions
                          .map((pos, index) => (pos[0] === floorIndex && pos[1] === tileIndex ? index : -1))
                          .filter(index => index !== -1);
                        
                        const isOccupied = playersOnTile.length > 0;
                        const ballColors = playersOnTile.map(index => playerColors[index]);
                        const ballColor = ballColors.length === 1 ? ballColors[0] : undefined;
                        const ballDirections = playersOnTile.map(index => playerDirections[index]);
                        
                        // Je to výtah (zobrazíme šipku)
                        const isElevator = isElevatorHere;
                        const hasHeart = floorIndex === heartPosition[0] && tileIndex === heartPosition[1];
                        
                        // Zkontrolovat, zda je toto políčko se srdíčkem a je zde vítěz
                        const isWinnerOnHeart = gameWon && winner !== null && 
                          floorIndex === heartPosition[0] && 
                          tileIndex === heartPosition[1] &&
                          playersOnTile.includes(winner);

                        // Barva políčka
                        const tileColor = FLOOR_COLORS[floorIndex];

                        // Získat stopu pro toto políčko
                        const footprintKey = `${floorIndex}-${tileIndex}`;
                        const footprint = footprints.get(footprintKey);

                        return (
                          <div key={tileIndex} className="relative" style={{ width: sizes.tileWidth, height: sizes.tileHeight }}>
                            {/* Číslo stopy - zobrazí se pod políčkem */}
                            {footprint && (
                              <motion.div
                                key={`${footprintKey}-${footprint.timestamp}`}
                                initial={{ opacity: 1, scale: 1.3, y: 15 }}
                                animate={{ opacity: 0, scale: 0.9, y: 30 }}
                                transition={{ duration: 5, ease: "easeOut" }}
                                className="absolute pointer-events-none z-20"
                                style={{
                                  bottom: '-40px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                }}
                              >
                                <div
                                  className="rounded-full px-4 py-2 shadow-lg border-2"
                                  style={{
                                    backgroundColor: playerColors[footprint.playerIndex],
                                    borderColor: 'white',
                                    color: 'white',
                                    fontSize: sizes.fontSize,
                                    fontWeight: 'bold',
                                    minWidth: '56px',
                                    textAlign: 'center',
                                  }}
                                >
                                  {footprint.step}
                                </div>
                              </motion.div>
                            )}
                            
                            {/* Velká šipka POD výtahem - zobrazuje se když výtah není animován - MUSÍ BÝT PŘED FloorTile */}
                            {isElevatorHere && !isElevatorAnimating && (() => {
                              // Responzivní pozicování šipky podle obtížnosti a velikosti obrazovky
                              const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
                              let topOffset: string;
                              
                              if (difficulty === 1) {
                                topOffset = isMobile ? 'calc(50% + 20px)' : 'calc(50% + 38px)';
                              } else if (difficulty === 2) {
                                topOffset = isMobile ? 'calc(50% + 16px)' : 'calc(50% + 34px)';
                              } else { // difficulty === 3
                                topOffset = isMobile ? 'calc(50% + 12px)' : 'calc(50% + 24px)';
                              }
                              
                              return (
                                <div className="absolute pointer-events-none" style={{ 
                                  left: '50%', 
                                  top: topOffset,
                                  transform: 'translateX(-50%)',
                                  width: difficulty === 3 ? '28px' : '36px',
                                  height: sizes.arrowHeight,
                                  zIndex: 0,
                                }}>
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 97">
                                    <g clipPath="url(#clip0_arrow)" id="Group_arrow">
                                      <path d="M11.7505 0V86.8252" id="Vector_arrow" stroke="#1800AE" strokeLinecap="round" strokeWidth="3" />
                                      <path d={svgPathsArrow.p1d825f00} fill="#1800AE" id="Polygon_arrow" stroke="#1800AE" strokeWidth="1.70275" />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_arrow">
                                        <rect fill="white" height="96.0908" width="23.501" />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </div>
                              );
                            })()}
                            
                            {/* Políčko - normální flow */}
                            <FloorTile
                              isOccupied={isOccupied}
                              ballColor={ballColor}
                              ballColors={ballColors}
                              ballDirections={ballDirections}
                              isElevator={isElevator}
                              isElevatorDown={false}
                              isElevatorAnimating={isElevatorAnimating}
                              hasHeart={hasHeart}
                              heartCollected={heartCollected}
                              isWinnerCelebrating={isWinnerOnHeart}
                              floorColor={tileColor}
                              ballSize={sizes.ballSize}
                              elevatorDrop={sizes.elevatorDrop}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== ANIMACE PÁDU - KROK MIMO POLÍČKO ===== */}
          <AnimatePresence>
            {playerFalling !== null && fallDirection && (
              <motion.div
                key="falling-effect"
                className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Text "SPADL!" */}
                <motion.div
                  className="text-6xl drop-shadow-2xl px-8 py-4 rounded-2xl"
                  style={{ 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: playerColors[playerFalling],
                    border: `4px solid ${playerColors[playerFalling]}`,
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  {playerNames[playerFalling]} SPADL!
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ovládací panel */}
          <div className="w-full lg:order-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-xl space-y-3 md:space-y-4 border-2 border-gray-200">
              {/* Výherní zpráva */}
              <AnimatePresence>
                {gameWon && winner !== null && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950 p-4 rounded-xl border-4 border-yellow-600 shadow-2xl">
                      <Trophy className="w-10 h-10 mx-auto mb-2 animate-bounce" />
                      <h2 className="text-xl mb-1">🎉 {playerNames[winner]} vyhrál! 🎉</h2>
                      {!wonByFalling && (
                        <p className="text-sm">Dorazil k srdíčku!</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Jednotný layout pro mobil i desktop */}
              {!gameWon && (
                <>
                  {/* Jednotný layout pro mobil i desktop */}
                  <div className="space-y-2">
                    {/* Před hodem: Jen "HRAJE: MODRÝ/ČERVENÝ" */}
                    {diceValue === 0 && (
                      <div className="mb-4">
                        <div
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-3 shadow-lg"
                          style={{
                            backgroundColor: `${playerColors[currentPlayer]}20`,
                            borderColor: playerColors[currentPlayer],
                          }}
                        >
                          <div className="w-12 h-12 lg:w-10 lg:h-10 rounded-full border-3 border-white shadow-md" style={{ backgroundColor: playerColors[currentPlayer] }} />
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl lg:text-lg text-gray-700 font-bold">HRAJE:</span>
                            <p className="text-2xl lg:text-xl" style={{ color: playerColors[currentPlayer], fontWeight: 'bold' }}>
                              {playerNames[currentPlayer].toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Losování PŘED hodem */}
                    {diceValue === 0 && (
                      <div className="text-center">
                        <Button
                          onClick={rollDice}
                          disabled={isRolling || isExecutingCommands || diceValue > 0}
                          className="px-8 py-6 text-xl rounded-xl text-white shadow-lg transition-all font-bold"
                          style={{
                            backgroundColor: playerColors[currentPlayer],
                            opacity: isRolling ? 0.7 : 1,
                          }}
                        >
                          {isRolling ? 'LOSUJI...' : 'LOSUJ POČET KROKŮ'}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Ovládání pohybu - zobrazí se pouze po hodu kostkou */}
              {!gameWon && diceValue > 0 && (
                <div className="space-y-3">
                  {/* Kroky nahoře, šipky pod nimi - pro mobil i desktop */}
                  <div className="space-y-2">
                    {/* Zobrazení příkazů - desktop - NAHOŘE */}
                    <div 
                      className="min-h-17 border-2 rounded-full p-3 pr-14 flex flex-wrap gap-1.5 items-center content-center justify-center transition-all relative" 
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: diceValue > 0 ? '#F9FAFB' : '#F3F4F6',
                        opacity: diceValue > 0 ? 1 : 0.6,
                      }}
                    >
                      {moveCommands.length === 0 ? (
                        <span className="text-lg font-extrabold text-gray-700 w-full text-center tracking-wide">ZADEJ KROKY</span>
                      ) : (
                        <>
                          {moveCommands.map((command, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-sm"
                              style={{
                                backgroundColor: `${playerColors[currentPlayer]}20`,
                                color: playerColors[currentPlayer],
                                borderColor: playerColors[currentPlayer],
                              }}
                            >
                              {command === 'left' ? (
                                <ChevronLeft className="w-6 h-6" strokeWidth={3} />
                              ) : (
                                <ChevronRight className="w-6 h-6" strokeWidth={3} />
                              )}
                            </span>
                          ))}
                        </>
                      )}
                      
                      {/* Křížek pro vymazání - vpravo v poli */}
                      {moveCommands.length > 0 && (
                        <button
                          onClick={handleClearCommands}
                          disabled={isExecutingCommands}
                          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 text-2xl rounded-full border-2 bg-gray-200 text-gray-600 border-gray-400 shadow-md hover:bg-gray-300 transition-all disabled:opacity-50"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Šipky + tlačítko JDI! vedle sebe */}
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => handleAddCommand('left')}
                        disabled={diceValue === 0 || isExecutingCommands}
                        className="w-14 h-14 text-xl rounded-full text-white shadow-lg transition-all"
                        style={{
                          backgroundColor: diceValue > 0 ? playerColors[currentPlayer] : '#D1D5DB',
                          opacity: diceValue > 0 ? 1 : 0.5,
                          cursor: diceValue > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <ChevronLeft className="w-7 h-7" />
                      </Button>

                      <Button
                        onClick={() => handleAddCommand('right')}
                        disabled={diceValue === 0 || isExecutingCommands}
                        className="w-14 h-14 text-xl rounded-full text-white shadow-lg transition-all"
                        style={{
                          backgroundColor: diceValue > 0 ? playerColors[currentPlayer] : '#D1D5DB',
                          opacity: diceValue > 0 ? 1 : 0.5,
                          cursor: diceValue > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <ChevronRight className="w-7 h-7" />
                      </Button>
                      
                      {/* Tlačítko JDI! - o 50% širší */}
                      <Button
                        onClick={handleExecuteCommands}
                        disabled={moveCommands.length === 0 || isExecutingCommands}
                        className="px-12 h-14 text-lg rounded-xl text-white shadow-lg transition-all font-bold"
                        style={{
                          backgroundColor: moveCommands.length > 0 ? playerColors[currentPlayer] : '#D1D5DB',
                          opacity: moveCommands.length > 0 ? 1 : 0.5,
                          cursor: moveCommands.length > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {isExecutingCommands ? '...' : 'JDI!'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Vylosované číslo - VELKÉ pod ovládacími prvky - mobil i desktop */}
                  <div className="text-center mt-4">
                    <div 
                      className="inline-flex items-center justify-center w-32 h-32 rounded-3xl shadow-xl border-4 border-white"
                      style={{
                        backgroundColor: playerColors[currentPlayer],
                        color: 'white',
                      }}
                    >
                      <span className="text-7xl font-extrabold">
                        {DICE_COUNT === 2 ? diceValue : diceValue}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tlačítko Nová hra - pouze na MOBILU pod ovládacím panelem */}
                  <Button 
                    onClick={resetGame} 
                    variant="outline" 
                    className="w-full lg:hidden bg-red-100 hover:bg-red-200 border-red-300 border-2 shadow-lg py-3 text-base rounded-lg transition-all mt-2"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Nová hra
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tlačítko Nová hra - pouze na DESKTOPU fixní pozice */}
      <Button 
        onClick={resetGame} 
        variant="outline" 
        className="hidden lg:flex fixed bottom-6 right-6 bg-red-100 hover:bg-red-200 border-red-300 shadow-xl z-10 px-6 py-6 text-lg rounded-xl"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Nová hra
      </Button>
    </div>
  );
}
