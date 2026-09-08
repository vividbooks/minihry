import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { LegoBlock } from './LegoBlock';
import { useAudio } from './AudioManager';
import { GameResultScreen } from './GameResultScreen';
import { Plus, Minus, Check } from 'lucide-react';

interface BuildNumberGameProps {
  settings?: {
    numberRange?: [number, number];
    maxBlocks?: number;
    feedbackDuration?: number;
    backgroundColor?: string;
  };
}

interface Block {
  id: string;
  value: number;
}

interface FoundCombination {
  id: string;
  blocks: Block[];
  targetNumber: number;
}

// Funkce pro generování všech možných kombinací
function generateAllCombinations(target: number, maxBlockCount: number): number[][] {
  const results: number[][] = [];
  
  // Generujeme kombinace pro různé počty bloků (1 až maxBlockCount)
  for (let blockCount = 1; blockCount <= maxBlockCount; blockCount++) {
    function backtrack(remaining: number, currentCombo: number[], position: number) {
      // Pokud jsme na poslední pozici
      if (position === blockCount - 1) {
        // Zkontrolujeme, jestli zbývající hodnota je v rozmezí 1-10
        if (remaining >= 1 && remaining <= 10) {
          results.push([...currentCombo, remaining]);
        }
        return;
      }
      
      // Zkoušíme všechny hodnoty od 1 do 10 na aktuální pozici
      for (let value = 1; value <= 10; value++) {
        if (remaining - value >= (blockCount - position - 1)) { // Musí zbýt alespoň 1 pro každou další pozici
          currentCombo.push(value);
          backtrack(remaining - value, currentCombo, position + 1);
          currentCombo.pop();
        }
      }
    }
    
    backtrack(target, [], 0);
  }
  
  return results;
}

export function BuildNumberGame({ settings = {} }: BuildNumberGameProps) {
  const {
    numberRange = [2, 10],
    maxBlocks = 3,
    feedbackDuration = 2000,
    backgroundColor = '#F5E6D0'
  } = settings;

  const [targetNumber, setTargetNumber] = useState(5);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', value: 1 },
    { id: '2', value: 1 }
  ]);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [isAnimatingCheck, setIsAnimatingCheck] = useState(false); // Nový stav pro animaci počítání
  const [highlightedCount, setHighlightedCount] = useState(0); // Kolik kolečeček je zvýrazněno
  const [highlightColor, setHighlightColor] = useState<'green' | 'red'>('green'); // Barva zvýraznění
  const [foundCombinations, setFoundCombinations] = useState<FoundCombination[]>([]); // Historie nalezených kombinací
  const [allPossibleCombinations, setAllPossibleCombinations] = useState<number[][]>([]); // Všechny možné kombinace pro aktuální číslo

  const { playSound } = useAudio();

  // Výpočet scale faktoru pro celý kontejner - POUZE na základě cílového čísla
  const calculateContainerScale = useCallback(() => {
    // Základní šířka jednoho dílku kostičky
    const blockWidth = 60;
    
    // Počítáme pouze s cílovou kostičkou (targetNumber)
    // Pro editovatelné kostičky počítáme s konzervativní hodnotou (maxBlocks * 3)
    const estimatedEditableBlocks = maxBlocks * 3;
    const totalBlocks = targetNumber + estimatedEditableBlocks;
    
    // Celková šířka obsahu (kostičky + rovnítko + mezery + padding)
    // Počítáme: kostičky + rovnítko (80px) + mezery (48px mezi sekcemi * 2) + padding (48px * 2)
    const contentWidth = (totalBlocks * blockWidth) + 80 + 96 + 96;
    
    // Dostupná šířka - využijeme 80% viewportu
    const availableWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1200;
    
    // Vypočítáme základní scale
    let calculatedScale = availableWidth / contentWidth;
    
    // Pro malé počty (2-5) přidáme mírný bonus na velikost
    if (targetNumber <= 5) {
      const bonus = 1.15 + (5 - targetNumber) * 0.075; // Čím menší číslo, tím větší bonus
      calculatedScale *= bonus;
    }
    
    // Vypočítáme maximální scale pro číslo 6 (zastropování)
    const maxTargetForCap = 6;
    const maxEstimatedBlocks = maxBlocks * 3;
    const maxTotalBlocks = maxTargetForCap + maxEstimatedBlocks;
    const maxContentWidth = (maxTotalBlocks * blockWidth) + 80 + 96 + 96;
    let maxScale = availableWidth / maxContentWidth;
    // Pro číslo 6 není bonus (je větší než 5)
    
    // Omezíme scale tak, aby nikdy nepřesáhl velikost pro číslo 6
    return Math.max(0.7, Math.min(maxScale, calculatedScale));
  }, [targetNumber, maxBlocks]);

  const containerScale = calculateContainerScale();

  // Generování nové úlohy
  const generateNewGame = useCallback(() => {
    const newTarget = Math.floor(Math.random() * (numberRange[1] - numberRange[0] + 1)) + numberRange[0];
    setTargetNumber(newTarget);
    
    // Vygenerujeme všechny možné kombinace pro toto číslo
    const combinations = generateAllCombinations(newTarget, maxBlocks);
    setAllPossibleCombinations(combinations);
    
    // Vytvoříme maxBlocks prázdných míst s hodnotou 0
    const initialBlocks: Block[] = [];
    for (let i = 0; i < maxBlocks; i++) {
      initialBlocks.push({ id: `${Date.now()}_${i}`, value: 0 });
    }
    setBlocks(initialBlocks);
    
    setShowGameComplete(false);
    setRoundInProgress(false);
    setFoundCombinations([]); // Vymažeme historii - nové číslo = nová historie
  }, [numberRange, maxBlocks]);

  // Inicializace první hry
  useEffect(() => {
    generateNewGame();
  }, []);

  // Zvýšit hodnotu kostičky
  const incrementBlock = useCallback((blockId: string) => {
    setBlocks(prev => 
      prev.map(block => 
        block.id === blockId && block.value < 10 
          ? { ...block, value: block.value + 1 }
          : block
      )
    );
    playSound('click');
  }, [playSound]);

  // Snížit hodnotu kostičky (minimálně na 0 - prázdné místo)
  const decrementBlock = useCallback((blockId: string) => {
    setBlocks(prev => 
      prev.map(block => 
        block.id === blockId && block.value > 0
          ? { ...block, value: block.value - 1 }
          : block
      )
    );
    playSound('click');
  }, [playSound]);



  // Spočítat součet všech kostiček
  const getCurrentSum = useCallback(() => {
    return blocks.reduce((sum, block) => sum + block.value, 0);
  }, [blocks]);

  // Kontrola zda je kombinace duplicitní
  const isCombinationDuplicate = useCallback((newBlocks: Block[]) => {
    // Odfiltrujeme prázdná místa (hodnota 0) před porovnáním
    const newValues = newBlocks.filter(b => b.value > 0).map(b => b.value);
    return foundCombinations.some(combo => {
      const comboValues = combo.blocks.filter(b => b.value > 0).map(b => b.value);
      return comboValues.length === newValues.length && 
             comboValues.every((val, idx) => val === newValues[idx]);
    });
  }, [foundCombinations]);

  // Kontrola odpovědi s animací postupného počítání
  const checkAnswer = useCallback(() => {
    const currentSum = getCurrentSum();
    const isCorrect = currentSum === targetNumber;
    
    // Zkontrolujeme zda je to duplicitní kombinace
    const isDuplicate = isCorrect && isCombinationDuplicate(blocks);
    
    // Nastavíme stav pro animaci
    setRoundInProgress(true);
    setIsAnimatingCheck(true);
    setHighlightedCount(0);
    
    // Určíme maximální počet kolečeček, které budeme vybarvovat
    const maxCount = Math.max(targetNumber, currentSum);
    
    // Určíme barvu - zelená pokud je správně A není duplicitní, červená pokud ne nebo je duplicitní
    const color = (isCorrect && !isDuplicate) ? 'green' : 'red';
    setHighlightColor(color);
    
    // Postupně vybarvujeme kolečka
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setHighlightedCount(count);
      
      // Zvukový efekt pro každé kolečko
      playSound('click');
      
      // Když jsme zvýraznili všechna kolečka
      if (count >= maxCount) {
        clearInterval(interval);
        
        // Po dokončení animace zpracujeme výsledek
        setTimeout(() => {
          setIsAnimatingCheck(false);
          setHighlightedCount(0);
          
          if (isCorrect && !isDuplicate) {
            // Uložíme správnou kombinaci do historie
            const newFoundCombinations = [
              ...foundCombinations,
              {
                id: `${Date.now()}`,
                blocks: blocks.map(b => ({ ...b })),
                targetNumber: targetNumber
              }
            ];
            setFoundCombinations(newFoundCombinations);
            
            // Zkontrolujeme, jestli už má všechny kombinace
            if (newFoundCombinations.length >= allPossibleCombinations.length) {
              // Našel všechny kombinace - nejprve zobrazíme přehled variant
              setTimeout(() => {
                setShowAllVariants(true);
                setRoundInProgress(false);
              }, 300);
            } else {
              // Resetujeme kostičky na prázdná místa (otazníky) pro další variantu
              setTimeout(() => {
                const resetBlocks: Block[] = [];
                for (let i = 0; i < maxBlocks; i++) {
                  resetBlocks.push({ id: `${Date.now()}_${i}`, value: 0 });
                }
                setBlocks(resetBlocks);
                setRoundInProgress(false);
              }, 300);
            }
          } else {
            // Špatná odpověď nebo duplicitní - jen zrušíme roundInProgress
            setTimeout(() => {
              setRoundInProgress(false);
            }, 300);
          }
        }, 500);
      }
    }, 400); // 400ms mezi jednotlivými kolečky
  }, [getCurrentSum, targetNumber, generateNewGame, playSound, blocks, isCombinationDuplicate, foundCombinations, allPossibleCombinations, maxBlocks]);

  return (
    <div 
      className="min-h-screen overflow-y-auto flex flex-col items-center justify-start p-4 relative" 
      style={{ backgroundColor }}
    >
      {/* Nadpis úplně nahoře */}
      <div className="text-center pt-4 pb-2">
        <h2 className="text-3xl md:text-4xl font-bold text-[#4e5871]">
          SLOŽ ČÍSLO
        </h2>
        
        {/* Progress bar varianty pod nadpisem */}
        <div className="mt-2 inline-block px-2 py-1">
          <div className="text-base font-bold text-green-600">
            Varianty: {foundCombinations.length}/{allPossibleCombinations.length}
          </div>
          <div className="w-48 h-3 bg-gray-300 rounded-full mt-2 shadow-inner">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300 shadow-md"
              style={{ 
                width: allPossibleCombinations.length > 0 
                  ? `${(foundCombinations.length / allPossibleCombinations.length) * 100}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Hlavní herní obsalt */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 py-8" style={{ marginTop: '40px' }}>

        {/* Herní plocha */}
        {!showAllVariants ? (
          /* Normální herní plocha - bílé podbarvení celé rovnice s CSS transform scale */
          <div 
            className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 px-12 py-6"
            style={{ 
              transform: `scale(${containerScale})`,
              transformOrigin: 'center center'
            }}
          >
          <div 
            className="flex flex-col lg:flex-row items-start justify-center transition-all duration-500"
            style={{ gap: isAnimatingCheck ? '24px' : '48px' }} // Kostičky se přisunou při kontrole
          >
            
            {/* Cílová kostička - zarovnána na horní hranu */}
            <div className="flex flex-col items-center gap-3">
              <LegoBlock 
                value={targetNumber} 
                isTarget 
                scale={1} 
                highlightedCount={highlightedCount}
                highlightColor={highlightColor}
              />
              {/* Prázdný prostor pro vyrovnání s tlačítky */}
              <div className="h-14"></div>
            </div>

            {/* Rovnítko */}
            <div 
              className="font-bold text-[#4e5871] -mt-4" 
              style={{ fontSize: '80px' }}
            >=</div>

            {/* Editovatelné kostičky */}
            <div 
              className="flex flex-nowrap items-start justify-center transition-all duration-500"
              style={{ gap: isAnimatingCheck ? '0px' : '32px' }}
            >
              <AnimatePresence mode="popLayout">
                {blocks.map((block, index) => {
                  // Vypočítáme offset pro zvýraznění kolečeček této kostičky
                  const previousBlocksSum = blocks.slice(0, index).reduce((sum, b) => sum + b.value, 0);
                  const blockHighlightedCount = Math.max(0, Math.min(block.value, highlightedCount - previousBlocksSum));
                  
                  return (
                    <motion.div
                      key={block.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="flex flex-col items-center gap-3"
                    >
                      {/* Kostička */}
                      <div>
                        <LegoBlock 
                          value={block.value} 
                          scale={1}
                          highlightedCount={blockHighlightedCount}
                          highlightColor={highlightColor}
                        />
                      </div>
                      
                      {/* Tlačítka +/- pod kostičkou - s inverzním scale pro konstantní velikost */}
                      {!isAnimatingCheck && (
                        <div 
                          className="flex gap-3"
                          style={{ transform: `scale(${1 / containerScale})`, transformOrigin: 'center' }}
                        >
                          <Button
                            onClick={() => decrementBlock(block.id)}
                            disabled={roundInProgress || block.value <= 0}
                            className="w-14 h-14 p-0 rounded-full bg-gray-400 hover:bg-gray-500 text-white border-none shadow-lg disabled:opacity-30 transition-all hover:scale-110"
                          >
                            <Minus className="w-7 h-7" />
                          </Button>
                          <Button
                            onClick={() => incrementBlock(block.id)}
                            disabled={roundInProgress || block.value >= 10}
                            className="w-14 h-14 p-0 rounded-full bg-gray-400 hover:bg-gray-500 text-white border-none shadow-lg disabled:opacity-30 transition-all hover:scale-110"
                          >
                            <Plus className="w-7 h-7" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Tlačítko kontroly (fajfka) - pod rovnicí, zelené - s inverzním scale pro konstantní velikost */}
          <div 
            className="flex justify-center mt-4"
            style={{ transform: `scale(${1 / containerScale})`, transformOrigin: 'center' }}
          >
            <Button
              onClick={checkAnswer}
              disabled={roundInProgress || getCurrentSum() === 0}
              className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 text-white border-none shadow-2xl disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
            >
              <Check className="w-12 h-12" strokeWidth={3} />
            </Button>
          </div>
        </div>
        ) : (
          /* Hláška o dokončení všech variant */
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 px-12 py-12 w-full max-w-4xl">
            <h2 className="text-4xl font-bold text-[#4e5871] mb-8 text-center">
              Našel jsi všechny varianty! 🎉
            </h2>
            
            {/* Tlačítko Pokračovat */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setShowAllVariants(false);
                  setShowGameComplete(true);
                }}
                className="px-8 py-4 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white border-none rounded-full shadow-lg"
              >
                Pokračovat →
              </Button>
            </div>
          </div>
        )}

        {/* Historie nalezených kombinací - vizuální rovnice s kostičkami */}
        {foundCombinations.length > 0 && (
          <div className="w-full pb-24" style={{ marginTop: '40px' }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <h3 className="text-2xl font-bold text-[#4e5871] mb-6 text-center">
                Složené varianty
              </h3>
              
              {/* Každá varianta na novém řádku */}
              <div className="space-y-4">
                {foundCombinations.map((combination) => (
                  <motion.div
                    key={combination.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-center gap-4"
                  >
                    {/* Cílová kostička */}
                    <div className="transform scale-75">
                      <LegoBlock value={combination.targetNumber} isTarget scale={1} />
                    </div>
                    
                    {/* Rovnítko */}
                    <div className="text-4xl font-bold text-[#4e5871]">=</div>
                    
                    {/* Kostičky z této varianty - bez mezer mezi nimi, jen bloky s hodnotou > 0 */}
                    <div className="flex items-center">
                      {combination.blocks
                        .filter(block => block.value > 0)
                        .map((block) => (
                          <div key={block.id} className="transform scale-75">
                            <LegoBlock value={block.value} scale={1} />
                          </div>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Tlačítko Nová úloha v pravém dolním rohu */}
      <div className="fixed bottom-4 right-4 lg:bottom-5 lg:right-5">
        <Button
          onClick={() => {
            generateNewGame();
            setFoundCombinations([]); // Vymažeme historii při nové úloze
          }}
          className="px-5 lg:px-6 py-2.5 lg:py-3 text-base lg:text-lg font-medium bg-[#4e5871] text-white hover:bg-[#3a4259] border-none rounded-full shadow-lg flex items-center gap-2"
        >
          Nová úloha
          <span className="text-lg lg:text-xl">🎲</span>
        </Button>
      </div>



      {/* Výsledková obrazovka s videem */}
      {showGameComplete && (
        <GameResultScreen
          isSuccess={true}
          onContinue={() => {
            setShowGameComplete(false);
            generateNewGame();
          }}
          autoHideDuration={undefined}
          successText={['Našel jsi všechny varianty! 🎯', 'Perfektní! Všechny kombinace! ⭐', 'Skvělé! Kompletní! 🏆', 'Výborně! Máš je všechny! 🎉'][Math.floor(Math.random() * 4)]}
          showContinueButton={true}
          displayType="gameComplete"
        />
      )}
    </div>
  );
}
