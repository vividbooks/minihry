import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GameResultScreen } from './GameResultScreen';

// ========== TYPES AND INTERFACES ==========
export type QuestionType = 'count' | 'addition' | 'subtraction' | 'comparison';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: number | string;
  objects?: string[];
  comparisonNumbers?: [number, number];
}

export interface GridCell {
  id: string;
  isRevealed: boolean;
  question: Question | null;
  x: number;
  y: number;
  questionMarkColor?: string;
  questionMarkRotation?: number;
  isCorrect?: boolean;
}

export interface GameState {
  grid: GridCell[][];
  currentQuestion: Question | null;
  selectedCell: { x: number; y: number } | null;
  score: number;
  mistakes: number;
  revealedCount: number;
  totalCells: number;
  isGameComplete: boolean;
  backgroundImage: string;
}

export interface GameSettings {
  gridSize?: number;
  numberRange?: [number, number];
  operationType?: string[];  // Změněno z questionTypes na operationType
  allowMistakes?: number;
  showHints?: boolean;
  backgroundColor?: string;
}

export interface GameProps {
  settings?: GameSettings;
  onBackToAdmin?: () => void;
}

// ========== UTILITY FUNCTIONS ==========
const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ========== MAIN GAME COMPONENT ==========
const ImageRevealGame: React.FC<GameProps> = ({ settings, onBackToAdmin }) => {
  // Debug výpis nastavení
  console.log('ImageRevealGame - Received settings:', settings);
  
  // Načtení nastavení s fallbacky
  const gridSize = settings?.gridSize || 4;
  const numberRange = settings?.numberRange || [1, 10];
  const backgroundColor = settings?.backgroundColor || '#FFB9A2';
  
  // Mapování nastavení operationType na questionTypes
  const getQuestionTypesFromSettings = (operationTypes: string[]): QuestionType[] => {
    return operationTypes.map(type => {
      switch (type) {
        case 'counting': return 'count';
        case 'addition': return 'addition';
        case 'subtraction': return 'subtraction';
        case 'comparison': return 'comparison';
        default: return 'addition';
      }
    });
  };
  
  const questionTypes = settings?.operationType 
    ? getQuestionTypesFromSettings(settings.operationType)
    : ['count', 'addition', 'subtraction', 'comparison'];
    
  console.log('ImageRevealGame - Question types after mapping:', questionTypes);
    
  const allowMistakes = settings?.allowMistakes || 3;
  const showHints = settings?.showHints !== false;
  
  // State pro obrázky
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  // Funkce pro načtení obrázků
  const loadBackgroundImages = useCallback(async () => {
    setIsLoadingImages(true);
    try {
      // Nové čtvercové obrázky roztomilých malých zvířátek
      const images = [
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/annalena5172_sweet_little_baby_lioness_is_marrying_and_happy_--_950a72e3-4913-4eb9-b1a2-bfbd46f0224e.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/argensis0843_Realistic_photography_film_texture_CG_rendering_ri_a04d6f78-caf8-4a6a-9197-bcbc2e1aec3b.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/basenote.kr_cute_cat_--v_7_38f55554-0715-4f65-b8da-d95135886488.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/bauvalohuiangfang_A_Northern_cardinal_standing_on_the_railing_s_a64a55a8-fdb5-4553-8bd9-9586da03f4e1.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/brazosparty_4k_cute_animal_--v_7_5fa38590-665d-415e-a660-da4c0ecf4b00.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/hmsmidjorney2_A_fox_taking_a_selfie_with_chicken_--profile_oeef_a88afdc9-99d3-499c-8cca-65938ddb056f.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/hois43277_korean_short_hair_cat_--v_7_e8244486-d134-4eb8-beb4-9a7f7df65bc0.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/horstwerner030_photo_of_an_arm_with_a_hand_holding_a_happy_litt_1b9b8712-8ab8-4690-9d48-fc6e169fc87c.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/ivo6077_2d_anime_dog_orange_without_mouth_anime_kawaii_--v_7_54048508-546b-43ac-91e8-e4e743bdcfc2.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/lightningpr00901_A_photo_of_a_baby_monkey_wearing_shorts_posted_8990b72f-85f0-4fa1-a6b0-b6437f7c9af5.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/lizardshampoo_Local_Raccoon_wakes_up_after_sleeping_for_like_12_3d282fd5-86be-429d-8a50-00ecda80c4e4.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/masonrie_realistic_image_of_a_fox_suspended_in_mid-air_in_a_jum_d9217f8a-acb5-48cd-9a56-f96caf5210f0.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/odee1026_An_Underwater_Bokeh_Aquarium_depicting_clown_fish_with_dbd15678-2bf8-4540-bb62-aa1c227b0cf3.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/odee1026_Create_a_video_of_a_lion_cub_playing_with_a_butterfly__04ad15f5-a4f9-4e37-8d91-27f34a17510b.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/pets_king_A_cute_little_squirrel_peeks_its_head_out_from_the_ta_85708033-15ab-4f9b-ba7f-e4a6a0cf9b01.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/studiosarchitecturefr_a_bird_standing_on_a_cable_side_view_phot_fff82db2-ef38-456d-867b-d361af337c9b.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/tanuki493_A_iPhone_photo_of_a_japanese_tanuki_on_a_small_outdoo_d5347aae-f87c-4a71-801d-3748471f0ba2.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/u9994567929_cute_cat_--v_7_1fb0e7f2-e780-41c3-b180-b5ad6ee32017.png'
      ];
      
      setBackgroundImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
      // Fallback images z vašeho úložiště
      setBackgroundImages([
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/basenote.kr_cute_cat_--v_7_38f55554-0715-4f65-b8da-d95135886488.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/ivo6077_2d_anime_dog_orange_without_mouth_anime_kawaii_--v_7_54048508-546b-43ac-91e8-e4e743bdcfc2.png',
        'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/u9994567929_cute_cat_--v_7_1fb0e7f2-e780-41c3-b180-b5ad6ee32017.png'
      ]);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);
  
  // Načtení obrázků při spuštění
  useEffect(() => {
    loadBackgroundImages();
  }, [loadBackgroundImages]);
  
  // Funkce pro náhodný výběr obrázku
  const getRandomBackgroundImage = useCallback(() => {
    if (backgroundImages.length === 0) {
      return 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/fotky_zobraz_obrazek/basenote.kr_cute_cat_--v_7_38f55554-0715-4f65-b8da-d95135886488.png';
    }
    const randomIndex = getRandomNumber(0, backgroundImages.length - 1);
    return backgroundImages[randomIndex];
  }, [backgroundImages]);
  
  // State hry
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    currentQuestion: null,
    selectedCell: null,
    score: 0,
    mistakes: 0,
    revealedCount: 0,
    totalCells: gridSize * gridSize,
    isGameComplete: false,
    backgroundImage: ''
  });

  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [shakingCell, setShakingCell] = useState<{x: number, y: number} | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  
  // Inicializace mřížky
  const initializeGrid = useCallback(() => {
    const grid: GridCell[][] = [];
    
    // Barevná paleta pro otazníky
    const colors = [
      'text-red-500', 'text-blue-500', 'text-green-500', 'text-purple-500', 
      'text-orange-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500',
      'text-yellow-600', 'text-cyan-500', 'text-rose-500', 'text-violet-500'
    ];
    
    for (let y = 0; y < gridSize; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < gridSize; x++) {
        // Náhodná barva a rotace pro každý čtvereček
        const randomColor = colors[getRandomNumber(0, colors.length - 1)];
        const randomRotation = getRandomNumber(-30, 30);
        
        row.push({
          id: generateId(),
          isRevealed: false,
          question: null,
          x,
          y,
          questionMarkColor: randomColor,
          questionMarkRotation: randomRotation
        });
      }
      grid.push(row);
    }
    
    return grid;
  }, [gridSize]);

  // Funkce pro restart hry
  const restartGame = useCallback(() => {
    const grid = initializeGrid();
    const newBackgroundImage = getRandomBackgroundImage();
    
    setGameState({
      grid,
      currentQuestion: null,
      selectedCell: null,
      score: 0,
      mistakes: 0,
      revealedCount: 0,
      totalCells: gridSize * gridSize,
      isGameComplete: false,
      backgroundImage: newBackgroundImage
    });
    setShowAnswerInput(false);
    setUserAnswer('');
    setShakingCell(null);
    setShowGameComplete(false);
  }, [initializeGrid, gridSize, getRandomBackgroundImage]);

  // Generování otázky podle typu
  const generateQuestion = useCallback((type: QuestionType): Question => {
    const [min, max] = numberRange;
    const id = generateId();
    
    switch (type) {
      case 'count': {
        const count = getRandomNumber(min, Math.min(max, 10));
        const objects = ['🐶', '🐱', '🐸', '🦋', '🌸', '⭐', '🎈', '🍎'];
        const selectedObject = objects[getRandomNumber(0, objects.length - 1)];
        const objectsArray = Array(count).fill(selectedObject);
        
        return {
          id,
          type: 'count',
          question: `Spočítej:`,
          correctAnswer: count,
          objects: objectsArray
        };
      }
      
      case 'addition': {
        const a = getRandomNumber(min, max);
        const b = getRandomNumber(min, max);
        return {
          id,
          type: 'addition',
          question: `${a} + ${b} = ?`,
          correctAnswer: a + b
        };
      }
      
      case 'subtraction': {
        const a = getRandomNumber(min + 5, max + 5);
        const b = getRandomNumber(min, Math.min(a, max));
        return {
          id,
          type: 'subtraction',
          question: `${a} - ${b} = ?`,
          correctAnswer: a - b
        };
      }
      
      case 'comparison': {
        const a = getRandomNumber(min, max);
        const b = getRandomNumber(min, max);
        
        let correctAnswer: string;
        if (a < b) {
          correctAnswer = 'LESS';
        } else if (a === b) {
          correctAnswer = 'EQUAL';
        } else {
          correctAnswer = 'GREATER';
        }
        
        return {
          id,
          type: 'comparison',
          question: `Porovnej čísla`,
          correctAnswer,
          comparisonNumbers: [a, b]
        };
      }
      
      default:
        return generateQuestion('addition');
    }
  }, [numberRange]);

  // Inicializace hry
  useEffect(() => {
    if (!isLoadingImages && backgroundImages.length > 0) {
      const grid = initializeGrid();
      const backgroundImage = getRandomBackgroundImage();
      
      setGameState(prev => ({
        ...prev,
        grid,
        totalCells: gridSize * gridSize,
        backgroundImage
      }));
    }
  }, [initializeGrid, gridSize, isLoadingImages, backgroundImages, getRandomBackgroundImage]);

  // Kliknutí na čtvereček
  const handleCellClick = useCallback((x: number, y: number) => {
    const cell = gameState.grid[y]?.[x];
    if (!cell || cell.isRevealed || gameState.isGameComplete) return;
    
    // Generuj novou otázku
    const availableTypes = questionTypes;
    const randomType = availableTypes[getRandomNumber(0, availableTypes.length - 1)];
    const question = generateQuestion(randomType);
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: question,
      selectedCell: { x, y }
    }));
    
    setShowAnswerInput(true);
    if (question.type !== 'comparison') {
      setUserAnswer('0');
    } else {
      setUserAnswer('');
    }
  }, [gameState.grid, gameState.isGameComplete, questionTypes, generateQuestion]);

  // Funkce pro vyhodnocení odpovědi
  const checkAnswer = useCallback((answer: string) => {
    const { currentQuestion } = gameState;
    if (!currentQuestion) return false;

    if (currentQuestion.type === 'comparison') {
      return answer === currentQuestion.correctAnswer;
    } else {
      const userNum = parseInt(answer) || 0;
      const correctNum = parseInt(currentQuestion.correctAnswer.toString()) || 0;
      return userNum === correctNum;
    }
  }, [gameState]);

  // Funkce pro zpracování kliknutí na tlačítko
  const handleButtonClick = useCallback((answer: string) => {
    const { currentQuestion, selectedCell } = gameState;
    if (!currentQuestion || !selectedCell) return;

    const isCorrect = checkAnswer(answer);
    
    if (isCorrect) {
      // Odhal čtvereček
      setGameState(prev => {
        const newGrid = [...prev.grid];
        newGrid[selectedCell.y][selectedCell.x] = {
          ...newGrid[selectedCell.y][selectedCell.x],
          isRevealed: true,
          question: currentQuestion,
          isCorrect: true
        };
        
        const newRevealedCount = prev.revealedCount + 1;
        const isComplete = newRevealedCount >= prev.totalCells;
        
        // Pokud je hra dokončena, zobraz celebrační obrazovku
        if (isComplete) {
          setTimeout(() => setShowGameComplete(true), 500);
        }
        
        return {
          ...prev,
          grid: newGrid,
          score: prev.score + 1,
          revealedCount: newRevealedCount,
          currentQuestion: null,
          selectedCell: null,
          isGameComplete: isComplete
        };
      });
      
      setShowAnswerInput(false);
      setUserAnswer('');
      
    } else {
      // Chybný čtvereček
      setGameState(prev => {
        const newGrid = [...prev.grid];
        newGrid[selectedCell.y][selectedCell.x] = {
          ...newGrid[selectedCell.y][selectedCell.x],
          question: currentQuestion,
          isCorrect: false
        };
        
        return {
          ...prev,
          grid: newGrid,
          mistakes: prev.mistakes + 1
        };
      });
      
      setShakingCell({x: selectedCell.x, y: selectedCell.y});
      
      // Cleanup po chybě
      setTimeout(() => {
        setGameState(prev => {
          const newGrid = [...prev.grid];
          
          newGrid[selectedCell.y][selectedCell.x] = {
            ...newGrid[selectedCell.y][selectedCell.x],
            question: null,
            isCorrect: undefined
          };
          
          // Skryj náhodný odhalený čtvereček
          if (prev.mistakes <= allowMistakes) {
            const revealedCells = [];
            for (let y = 0; y < newGrid.length; y++) {
              for (let x = 0; x < newGrid[y].length; x++) {
                if (newGrid[y][x].isRevealed) {
                  revealedCells.push({x, y});
                }
              }
            }
            
            if (revealedCells.length > 0) {
              const randomIndex = getRandomNumber(0, revealedCells.length - 1);
              const cellToHide = revealedCells[randomIndex];
              
              newGrid[cellToHide.y][cellToHide.x] = {
                ...newGrid[cellToHide.y][cellToHide.x],
                isRevealed: false,
                question: null,
                isCorrect: undefined
              };
              
              return {
                ...prev,
                grid: newGrid,
                revealedCount: Math.max(0, prev.revealedCount - 1),
                currentQuestion: null,
                selectedCell: null
              };
            }
          }
          
          return {
            ...prev,
            grid: newGrid,
            currentQuestion: null,
            selectedCell: null
          };
        });
        
        setShakingCell(null);
      }, 1000);
      
      setShowAnswerInput(false);
      setUserAnswer('');
    }
  }, [gameState, checkAnswer, allowMistakes]);

  // Submit funkce pro číselné odpovědi
  const handleNumberSubmit = useCallback(() => {
    handleButtonClick(userAnswer);
  }, [userAnswer, handleButtonClick]);

  if (isLoadingImages) {
    return (
      <div className="min-h-screen flex items-center justify-center font-visby">
        <div className="text-2xl">Načítání obrázků...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex relative font-visby"
      style={{ backgroundColor }}
    >
      {/* Celebrační obrazovka pro dokončení hry */}
      {showGameComplete && (
        <GameResultScreen
          isSuccess={true}
          displayType="gameComplete"
          successText="ÚŽASNĚ! OBRÁZEK ODKRYT!"
          onContinue={restartGame}
          showContinueButton={true}
        />
      )}

      {/* Odstraňujeme tlačítko zpět - už se neobjevuje */}

      {/* Hlavní oblast s mřížkou */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          {/* Pozadí obrázek */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 rounded-lg"
            style={{ backgroundImage: `url(${gameState.backgroundImage})` }}
          />
          
          {/* Mřížka bez mezer */}
          <div 
            className="grid relative z-10 bg-white rounded-lg p-1 shadow-lg border-2 border-blue-200"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: 'min(80vh, 60vw)',
              height: 'min(80vh, 60vw)'
            }}
          >
            {gameState.grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={cell.id}
                  className={`
                    aspect-square flex items-center justify-center cursor-pointer
                    transition-all duration-200 hover:bg-blue-50 border border-blue-200
                    ${cell.isRevealed 
                      ? 'bg-transparent' 
                      : cell.isCorrect === false
                        ? 'bg-red-500 border-red-600 animate-pulse'
                        : 'bg-white hover:bg-blue-50'
                    }
                    ${gameState.selectedCell?.x === x && gameState.selectedCell?.y === y 
                      ? 'ring-2 ring-blue-400' 
                      : ''
                    }
                    ${shakingCell?.x === x && shakingCell?.y === y ? 'animate-bounce' : ''}
                  `}
                  onClick={() => handleCellClick(x, y)}
                >
                  {cell.isRevealed ? (
                    <div className="w-full h-full relative">
                      <div 
                        className="w-full h-full"
                        style={{ 
                          backgroundImage: `url(${gameState.backgroundImage})`,
                          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                          backgroundPosition: `${(x / (gridSize - 1)) * 100}% ${(y / (gridSize - 1)) * 100}%`,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </div>
                  ) : cell.isCorrect === false ? (
                    <div className="text-white font-bold text-4xl font-visby">❌</div>
                  ) : (
                    <div 
                      className={`font-bold text-4xl font-visby ${cell.questionMarkColor || 'text-gray-500'}`}
                      style={{ 
                        transform: `rotate(${cell.questionMarkRotation || 0}deg)`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ?
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Postranní panel */}
      <div className="w-full max-w-[min(600px,85vw)] p-4 md:p-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-center space-y-6">
          {/* Oblast pro otázky */}
          {showAnswerInput && gameState.currentQuestion && (
            <Card className="p-6 md:p-8 space-y-6 md:space-y-8 bg-white shadow-xl min-h-[400px] md:min-h-[500px] flex flex-col justify-center">
              <div className="text-center">
                
                {/* COMPARISON OTÁZKY - zvětšeno o 20% */}
                {gameState.currentQuestion.type === 'comparison' && gameState.currentQuestion.comparisonNumbers ? (
                  <div className="space-y-6 md:space-y-8">
                    <div className="text-[1.2rem] md:text-[2.4rem] text-gray-600 mb-4 md:mb-6 font-visby">Porovnej čísla:</div>
                    
                    <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-8">
                      <div className="text-[4.8rem] md:text-[9.6rem] font-bold text-blue-600 font-visby">
                        {gameState.currentQuestion.comparisonNumbers[0]}
                      </div>
                      <div className="text-[3.6rem] md:text-[7.2rem] font-bold text-gray-400 font-visby">?</div>
                      <div className="text-[4.8rem] md:text-[9.6rem] font-bold text-blue-600 font-visby">
                        {gameState.currentQuestion.comparisonNumbers[1]}
                      </div>
                    </div>
                    
                    {/* TLAČÍTKA PRO POROVNÁNÍ */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center py-4 md:py-6 h-auto border-3 hover:bg-blue-100 font-visby"
                        onClick={() => handleButtonClick('LESS')}
                      >
                        <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 font-visby">{'<'}</div>
                        <div className="text-xs md:text-lg text-gray-600 font-visby">menší</div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex flex-col items-center py-4 md:py-6 h-auto border-3 hover:bg-blue-100 font-visby"
                        onClick={() => handleButtonClick('EQUAL')}
                      >
                        <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 font-visby">=</div>
                        <div className="text-xs md:text-lg text-gray-600 font-visby">rovná se</div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex flex-col items-center py-4 md:py-6 h-auto border-3 hover:bg-blue-100 font-visby"
                        onClick={() => handleButtonClick('GREATER')}
                      >
                        <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 font-visby">{'>'}</div>
                        <div className="text-xs md:text-lg text-gray-600 font-visby">větší</div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Zvětšeno o 20% */}
                    <h3 className="text-[3.6rem] md:text-6xl font-bold mb-6 md:mb-8 text-gray-800 font-visby">
                      {gameState.currentQuestion.question}
                    </h3>
                    
                    {/* POČÍTÁNÍ OBJEKTŮ - zvětšeno o 20% */}
                    {gameState.currentQuestion.type === 'count' && gameState.currentQuestion.objects && (
                      <div className="mb-6 md:mb-8">
                        <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-md md:max-w-lg mx-auto">
                          {gameState.currentQuestion.objects.map((obj, index) => (
                            <span key={index} className="text-[3.6rem] md:text-6xl">{obj}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* ČÍSELNÝ DISPLEJ SE ŠIPKAMI NA FIXNÍ POZICI */}
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-center">
                        {/* Container s fixní šířkou pro číslo */}
                        <div className="w-48 md:w-80 flex justify-center">
                          {/* Velké číslo bez rámečku */}
                          <div className="text-[5rem] md:text-[10rem] font-bold text-gray-800 font-visby leading-none">
                            {userAnswer || '0'}
                          </div>
                        </div>
                        
                        {/* Šipky na fixní pozici vpravo */}
                        <div className="flex flex-col gap-1 ml-4">
                          {/* Šipka nahoru */}
                          <button
                            type="button"
                            className="w-16 h-16 md:w-20 md:h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl md:text-4xl font-bold transition-colors font-visby"
                            onClick={() => {
                              const currentValue = parseInt(userAnswer) || 0;
                              setUserAnswer((currentValue + 1).toString());
                            }}
                          >
                            ▲
                          </button>
                          
                          {/* Šipka dolů */}
                          <button
                            type="button"
                            className="w-16 h-16 md:w-20 md:h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl md:text-4xl font-bold transition-colors font-visby"
                            onClick={() => {
                              const currentValue = parseInt(userAnswer) || 0;
                              if (currentValue > 0) {
                                setUserAnswer((currentValue - 1).toString());
                              }
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleNumberSubmit}
                        className="w-full text-lg md:text-2xl py-3 md:py-4 h-auto bg-green-500 hover:bg-green-600 font-visby"
                        disabled={!userAnswer.trim()}
                      >
                        ✓ Potvrdit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Když není aktivní otázka */}
          {!showAnswerInput && (
            <div className="text-center p-4 md:p-6">
              <h2 className="text-xl md:text-3xl font-bold text-red-600 mb-2 md:mb-3 font-visby">Odkryj obrázek</h2>
              <div className="text-base md:text-xl text-gray-600 font-visby">Klikni na otazník a najdi výsledek</div>
            </div>
          )}
        </div>

        {/* Tlačítko Nová hra */}
        <div className="mt-4 md:mt-6 flex justify-center">
          <Button 
            variant="outline"
            className="w-28 md:w-36 text-gray-600 hover:text-gray-800 py-2 md:py-3 text-sm md:text-base border-gray-300 hover:border-gray-400 font-visby"
            onClick={restartGame}
          >
            Nová hra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageRevealGame;