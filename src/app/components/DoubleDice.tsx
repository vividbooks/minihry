import { Button } from "./ui/button";

export interface DoubleDiceProps {
  values: [number, number];
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
  playerColor?: string;
}

export function DoubleDice({ values, isRolling, onRoll, disabled, playerColor = '#6B7280' }: DoubleDiceProps) {
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
      {/* Klikatelný obal pro obě kostky s textem */}
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`relative flex flex-col items-center gap-4 transition-all duration-200 ${
          isRolling 
            ? '' 
            : 'hover:scale-105 cursor-pointer'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        {/* Dvě kostky vedle sebe */}
        <div className="flex gap-4">
          {values.map((value, index) => (
            <div 
              key={index}
              className={`relative w-32 h-32 lg:w-24 lg:h-24 rounded-xl shadow-2xl transition-all duration-200 flex items-center justify-center`}
              style={{ 
                backgroundColor: playerColor,
                background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}CC 100%)`,
                animationName: isRolling ? 'simpleJump' : 'none',
                animationDuration: isRolling ? '0.8s' : '0s',
                animationTimingFunction: isRolling ? 'ease-out' : 'linear',
                animationDelay: isRolling ? `${index * 0.1}s` : '0s',
                boxShadow: isRolling 
                  ? `0 10px 25px ${playerColor}40, 0 0 20px ${playerColor}30` 
                  : `0 8px 20px ${playerColor}30`
              }}
            >
              {/* Zobrazení teček na kostce */}
              {!isRolling && value > 0 && (
                <div 
                  className="grid grid-cols-3 gap-1 lg:gap-1 w-full h-full p-3 lg:p-2"
                  style={{
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {getDicePattern(value).map((dot, dotIndex) => (
                    <div
                      key={dotIndex}
                      className="flex items-center justify-center"
                    >
                      {dot && (
                        <div 
                          className="w-5 h-5 lg:w-4 lg:h-4 rounded-full bg-white"
                          style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isRolling && (
                <div className="text-white text-3xl lg:text-3xl font-visby">
                  ?
                </div>
              )}
              
              {/* Lesklý efekt na kostce */}
              <div 
                className="absolute top-1 left-1 w-8 h-8 lg:w-6 lg:h-6 rounded-full opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, white 0%, transparent 70%)'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Text pod kostkami - zobrazí se jen když ještě nelosoval */}
        {!isRolling && values[0] === 0 && values[1] === 0 && (
          <div className="text-white text-center font-visby px-6 py-3 rounded-lg shadow-lg leading-tight"
            style={{ 
              backgroundColor: playerColor,
              background: `linear-gradient(135deg, ${playerColor} 0%, ${playerColor}CC 100%)`,
            }}
          >
            <div className="text-xl lg:text-2xl font-bold">HOĎ KOSTKOU</div>
          </div>
        )}
      </button>
    </div>
  );
}