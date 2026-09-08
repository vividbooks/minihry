import { Button } from "./ui/button";

export interface DiceProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
  playerColor?: string;
  large?: boolean;
}

export function Dice({ value, isRolling, onRoll, disabled, playerColor = '#6B7280', large = false }: DiceProps) {
  const getDicePattern = (num: number) => {
    // Použijeme CSS grid 3x3 pro umístění teček
    const patterns: { [key: number]: string[] } = {
      1: ['', '', '', '', '●', '', '', '', ''],
      2: ['●', '', '', '', '', '', '', '', '●'],
      3: ['●', '', '', '', '●', '', '', '', '●'],
      4: ['●', '', '●', '', '', '', '●', '', '●'],
      5: ['●', '', '●', '', '●', '', '●', '', '●'],
      6: ['●', '', '●', '●', '', '●', '●', '', '●']
    };
    return patterns[num] || [];
  };

  return (
    <div className="flex flex-col items-center font-visby">
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`relative ${large ? 'w-28 h-28 lg:w-64 lg:h-64' : 'w-36 h-36 lg:w-48 lg:h-48'} rounded-xl shadow-2xl transition-all duration-200 flex flex-col items-center justify-center ${
          isRolling 
            ? '' 
            : 'hover:scale-105 hover:shadow-xl cursor-pointer'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
        style={{ 
          backgroundColor: playerColor,
          background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}CC 100%)`,
          animation: isRolling ? 'simpleJump 0.8s ease-out' : 'none',
          boxShadow: isRolling 
            ? `0 10px 25px ${playerColor}40, 0 0 20px ${playerColor}30` 
            : `0 8px 20px ${playerColor}30`
        }}
      >
        {/* Kostka - při hodnotě 0 zobrazí text "HOĎ KOSTKOU", jinak tečky */}
        {!isRolling && value === 0 && (
          <div className="text-white text-center font-visby leading-tight">
            <div className={`${large ? 'text-xl lg:text-4xl' : 'text-2xl lg:text-3xl'} font-bold`}>HOĎ</div>
            <div className={`${large ? 'text-xl lg:text-4xl' : 'text-2xl lg:text-3xl'} font-bold`}>KOSTKOU</div>
          </div>
        )}
        
        {!isRolling && value > 0 && (
          <div 
            className="grid grid-cols-3 gap-1 lg:gap-2 w-full h-full p-4 lg:p-6"
            style={{
              display: 'grid',
              placeItems: 'center'
            }}
          >
            {getDicePattern(value).map((dot, index) => (
              <div
                key={index}
                className="flex items-center justify-center"
              >
                {dot && (
                  <div 
                    className={`${large ? 'w-6 h-6 lg:w-12 lg:h-12' : 'w-6 h-6 lg:w-10 lg:h-10'} rounded-full bg-white`}
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        {isRolling && (
          <div className="text-white text-4xl lg:text-6xl font-visby">
            ?
          </div>
        )}
        
        {/* Lesklý efekt na kostce */}
        <div 
          className="absolute top-1 left-1 w-10 h-10 lg:w-8 lg:h-8 rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, white 0%, transparent 70%)'
          }}
        />
      </button>
    </div>
  );
}