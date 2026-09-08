import React from 'react';
import { Button } from './ui/button';
import { RotateCcw, Shuffle, Play, Eraser } from 'lucide-react';
import { COLORS, Difficulty, APP_COLORS, getDifficultyIcon, getDifficultyName, isEraser } from '../constants/mirrorDrawingData';

interface CompactControlsProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onEvaluate: () => void;
  onReset: () => void;
  onNewLevel: () => void;
  isEvaluated: boolean;
  gridSize: number;
}

export function CompactControls({
  selectedColor,
  onColorSelect,
  difficulty,
  onDifficultyChange,
  onEvaluate,
  onReset,
  onNewLevel,
  isEvaluated,
  gridSize
}: CompactControlsProps) {
  // Všechny barvy kromě první bílé (pozadí)
  const availableColors = COLORS.slice(1);

  // Tyto funkce jsou nyní importované z konstant

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm lg:max-w-md xl:max-w-lg">
      <div className="p-6 lg:p-8 xl:p-10">
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Barvy a guma */}
          <div>
            <p className="text-lg lg:text-xl xl:text-2xl mb-4 lg:mb-6" style={{ color: APP_COLORS.TASK_TEXT }}>
              Barva:
            </p>
            <div className="grid grid-cols-4 gap-3 lg:gap-4 xl:gap-5">
              {availableColors.map((color, index) => {
                const isSelected = selectedColor === color;
                const isEraserColor = isEraser(color);
                
                return (
                  <button
                    key={color + index}
                    className={`
                      w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-xl lg:rounded-2xl 
                      transition-all duration-200 hover:scale-105 flex items-center justify-center
                      ${isSelected ? 'ring-4 lg:ring-5 ring-offset-2 lg:ring-offset-3' : ''}
                    `}
                    style={{ 
                      backgroundColor: isEraserColor ? '#f8f8f8' : color,
                      borderWidth: '2px',
                      borderColor: isSelected ? APP_COLORS.TASK_TEXT : APP_COLORS.BUTTON_BORDER,
                      ringColor: isSelected ? APP_COLORS.TASK_TEXT : 'transparent'
                    }}
                    onClick={() => onColorSelect(color)}
                  >
                    {isEraserColor && (
                      <Eraser 
                        className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10" 
                        style={{ color: APP_COLORS.TASK_TEXT }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Akce */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <Button 
              onClick={onEvaluate} 
              disabled={isEvaluated}
              size="lg"
              className="w-full h-12 lg:h-14 xl:h-16 text-base lg:text-lg xl:text-xl border-2"
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                borderColor: '#4CAF50'
              }}
            >
              <Play className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
              Vyhodnotit
            </Button>
            
            <div className="flex gap-3 lg:gap-4">
              <Button 
                onClick={onReset} 
                variant="outline"
                size="lg"
                disabled={!isEvaluated}
                className="flex-1 h-10 lg:h-12 xl:h-14 border-2"
                style={{
                  borderColor: APP_COLORS.BUTTON_BORDER,
                  color: APP_COLORS.TASK_TEXT,
                }}
              >
                <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              </Button>
              <Button 
                onClick={onNewLevel} 
                variant="outline"
                size="lg"
                className="flex-1 h-10 lg:h-12 xl:h-14 border-2"
                style={{
                  borderColor: APP_COLORS.BUTTON_BORDER,
                  color: APP_COLORS.TASK_TEXT,
                }}
              >
                <Shuffle className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              </Button>
            </div>
          </div>

          {/* Obtížnost na spodku - roztažená na celou šířku */}
          <div className="flex gap-3 lg:gap-4">
            {Object.values(Difficulty).map((diff) => (
              <button
                key={diff}
                onClick={() => onDifficultyChange(diff)}
                className={`
                  flex-1 flex items-center justify-center h-10 lg:h-12 xl:h-14
                  rounded-lg transition-all duration-200 hover:scale-105
                  ${difficulty === diff ? 'ring-2 ring-offset-1' : ''}
                `}
                style={{
                  backgroundColor: difficulty === diff ? APP_COLORS.TASK_TEXT : 'white',
                  borderWidth: '2px',
                  borderColor: difficulty === diff ? APP_COLORS.TASK_TEXT : APP_COLORS.BUTTON_BORDER,
                  ringColor: difficulty === diff ? APP_COLORS.TASK_TEXT : 'transparent'
                }}
              >
                <span 
                  className="text-base lg:text-lg xl:text-xl"
                  style={{ 
                    color: difficulty === diff ? 'white' : APP_COLORS.TASK_TEXT
                  }}
                >
                  {getDifficultyIcon(diff)}
                </span>
              </button>
            ))}
          </div>

          {/* Instrukce */}
          <div className="text-sm lg:text-base text-gray-500 text-center">
            <p>💡 Táhni myší pro kreslení</p>
          </div>
        </div>
      </div>
    </div>
  );
}